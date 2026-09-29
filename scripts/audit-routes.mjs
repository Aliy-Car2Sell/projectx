/**
 * Which pages does a change touch? Used by the quick audit (scripts/audit.mjs --quick).
 *
 * changed files (git, against the merge base with `main`)
 *   -> import graph of apps/<app>/src and packages/<pkg>/src
 *   -> routes whose page (or a layout / loading file above it) reaches a changed file
 *   -> the audit's seed URLs of those routes
 *
 * Message files are mapped through the keys that changed: a file is touched when it reads a changed
 * key (`useTranslations("records.audit")` + `t("title")`). Routes are ranked by how specific the
 * change is to them: a file only three pages use outranks one that every page imports.
 */
/** A change reaching at most this many routes is "about" them; beyond that it is a shared helper. */
export const NARROW = 6;
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SOURCE_RE = /\.(tsx?|mjs|jsx?)$/;
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo", "dist"]);
/** Files Next.js applies to every page below their folder. */
const SPECIAL = ["layout", "loading", "template", "error", "not-found"];

const posix = (p) => p.split(path.sep).join("/");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// ---------- git ----------
/** Files this branch changed (committed or not) since it left `base`, plus untracked ones. Repo-relative, posix. */
export function changedFiles(root, base) {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const lines = (s) => s.split("\n").filter(Boolean);
  let mergeBase;
  try {
    mergeBase = git("merge-base", base, "HEAD").trim();
  } catch {
    throw new Error(`quick audit: cannot compare with "${base}" (no such branch or no common history). Pass --base <ref>, or run the full audit.`);
  }
  const files = new Set([...lines(git("diff", "--name-only", mergeBase)), ...lines(git("ls-files", "--others", "--exclude-standard"))]);
  const show = (file) => {
    try {
      return git("show", `${mergeBase}:${file}`);
    } catch {
      return null; // the file is new
    }
  };
  return { base, mergeBase, files: [...files].sort(), show };
}

// ---------- import graph ----------
function packageExports(root) {
  const out = new Map(); // "@projectx/ui" -> [{ key, target }]
  const dir = path.join(root, "packages");
  for (const name of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const file = path.join(dir, name, "package.json");
    if (!fs.existsSync(file)) continue;
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    const exp = typeof pkg.exports === "string" ? { ".": pkg.exports } : (pkg.exports ?? {});
    out.set(pkg.name, { dir: path.join(dir, name), entries: Object.entries(exp).filter(([, v]) => typeof v === "string") });
  }
  return out;
}

const EXTENSIONS = ["", ".ts", ".tsx", ".mjs", ".js", ".jsx", "/index.ts", "/index.tsx"];
function existing(file) {
  for (const ext of EXTENSIONS) {
    const p = file + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function resolveImport(root, packages, importer, spec) {
  if (spec.startsWith(".")) return existing(path.resolve(path.dirname(importer), spec));
  if (spec.startsWith("@/")) {
    // tsconfig "@/*" -> apps/<app>/src/*
    const m = posix(path.relative(root, importer)).match(/^(apps\/[^/]+)\//);
    return m ? existing(path.join(root, m[1], "src", spec.slice(2))) : null;
  }
  const m = spec.match(/^(@[^/]+\/[^/]+)(\/.*)?$/);
  const pkg = m && packages.get(m[1]);
  if (!pkg) return null; // react, next, lucide-react…
  const sub = "." + (m[2] ?? "");
  // Like Node: an exact key wins, then the pattern with the longest prefix.
  let best = null;
  for (const [key, target] of pkg.entries) {
    if (key === sub) return existing(path.join(pkg.dir, target));
    const star = key.indexOf("*");
    if (star < 0) continue;
    const [pre, post] = [key.slice(0, star), key.slice(star + 1)];
    if (sub.startsWith(pre) && sub.endsWith(post) && sub.length >= pre.length + post.length && (!best || pre.length > best.pre.length)) {
      best = { pre, target, middle: sub.slice(pre.length, sub.length - post.length) };
    }
  }
  return best ? existing(path.join(pkg.dir, best.target.replace("*", best.middle))) : null;
}

/** Module specifiers a file loads at runtime (`import type` is erased by the compiler, so it is left out). */
export function importsOf(code) {
  const out = new Set();
  for (const m of code.matchAll(/(?:^|[\n;])\s*(?:import|export)\s+(type\s+)?(?:[^'"`;]*?\s+from\s*)?["']([^"'\n]+)["']/g)) if (!m[1]) out.add(m[2]);
  for (const m of code.matchAll(/\bimport\(\s*["']([^"'\n]+)["']\s*\)/g)) out.add(m[1]);
  return [...out];
}

function buildGraph(root) {
  const packages = packageExports(root);
  const files = [];
  for (const group of ["apps", "packages"]) {
    const dir = path.join(root, group);
    for (const name of fs.existsSync(dir) ? fs.readdirSync(dir) : []) files.push(...walk(path.join(dir, name, "src")));
  }
  const graph = new Map(); // abs file -> abs files it imports
  const text = new Map();
  for (const file of files.filter((f) => SOURCE_RE.test(f))) {
    const code = fs.readFileSync(file, "utf8");
    text.set(file, code);
    graph.set(file, importsOf(code).map((s) => resolveImport(root, packages, file, s)).filter(Boolean));
  }
  return { graph, text };
}

// ---------- routes ----------
/** `apps/<app>/src/app/(shell)/patients/[id]/page.tsx` -> "/patients/[id]" (route groups drop out). */
function routeOf(appDir, pageFile) {
  const segs = posix(path.relative(path.join(appDir, "src", "app"), path.dirname(pageFile)))
    .split("/")
    .filter((s) => s && s !== "." && !/^\(.*\)$/.test(s) && !s.startsWith("@"));
  return "/" + segs.join("/");
}

export function routePattern(route) {
  const src = route
    .split("/")
    .map((s) => {
      if (/^\[\[\.\.\..+\]\]$/.test(s)) return "(?:.+)?";
      if (/^\[\.\.\..+\]$/.test(s)) return ".+";
      if (/^\[.+\]$/.test(s)) return "[^/]+";
      return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^${src || "/"}/?$`);
}

function appRoutes(root, app) {
  const appDir = path.join(root, "apps", app);
  const appRoot = path.join(appDir, "src", "app");
  const all = walk(appRoot);
  const routes = [];
  for (const page of all.filter((f) => /[\\/]page\.tsx?$/.test(f))) {
    // The page itself, then every layout / loading / error file from its folder up to app/.
    const entries = [page];
    for (let dir = path.dirname(page); dir.startsWith(appRoot); dir = path.dirname(dir)) {
      for (const name of SPECIAL) for (const ext of [".tsx", ".ts"]) if (fs.existsSync(path.join(dir, name + ext))) entries.push(path.join(dir, name + ext));
      if (dir === appRoot) break;
    }
    routes.push({ app, route: routeOf(appDir, page), page, entries });
  }
  return routes;
}

function closure(graph, entries) {
  const seen = new Set(entries);
  const queue = [...entries];
  while (queue.length) for (const dep of graph.get(queue.shift()) ?? []) if (!seen.has(dep)) (seen.add(dep), queue.push(dep));
  return seen;
}

// ---------- messages ----------
const flatten = (o, p = "", out = new Map()) => {
  for (const [k, v] of Object.entries(o ?? {})) {
    if (v && typeof v === "object") flatten(v, p + k + ".", out);
    else out.set(p + k, v);
  }
  return out;
};

/** Keys added, removed or reworded in a messages file since the base. */
function changedKeys(root, change, file) {
  const parse = (s) => {
    try {
      return flatten(JSON.parse(s));
    } catch {
      return new Map();
    }
  };
  const abs = path.join(root, file);
  const now = fs.existsSync(abs) ? parse(fs.readFileSync(abs, "utf8")) : new Map();
  const was = parse(change.show(file) ?? "{}");
  const out = [];
  for (const k of new Set([...now.keys(), ...was.keys()])) if (now.get(k) !== was.get(k)) out.push(k);
  return out;
}

/** Does `code` read message `key`? It must open a namespace above the key and name the rest of it. */
function readsKey(code, key) {
  for (const m of code.matchAll(/\b(?:useTranslations|getTranslations)\(\s*(?:["']([^"']*)["'])?\s*\)/g)) {
    const ns = m[1] ?? "";
    if (ns && key !== ns && !key.startsWith(ns + ".")) continue;
    const rest = ns ? key.slice(ns.length + 1) : key;
    if (!rest) return true;
    if (code.includes(`"${rest}"`) || code.includes(`'${rest}'`) || code.includes("`" + rest + "`")) return true;
    // t(`severity.${value}`), t("status." + s): a computed key under one of the key's own prefixes
    const parts = rest.split(".");
    for (let i = 1; i < parts.length; i++) {
      const prefix = parts.slice(0, i).join(".") + ".";
      if (code.includes("`" + prefix + "${") || code.includes(`"${prefix}" +`) || code.includes(`'${prefix}' +`)) return true;
    }
    // t(value) with the whole key computed: `t(k)`, `t(s.status)`
    if (parts.length === 1 && /\bt[a-z]*\(\s*[a-zA-Z_$][\w$.]*\s*[,)]/.test(code) && new RegExp(`["'\`]${parts[0]}["'\`]`).test(code)) return true;
  }
  return false;
}

// ---------- the plan ----------
/**
 * @param seeds  app -> the audit's seed URLs
 * @returns per app: affected URLs best first, each with the changed files that lead to it
 */
export function affectedPages(root, apps, seeds, base = "main") {
  const change = changedFiles(root, base);
  const { graph, text } = buildGraph(root);
  const abs = (f) => path.join(root, f);
  const rel = (f) => posix(path.relative(root, f));

  // What counts as changed: source and style files directly, message files through the code reading the changed keys.
  const changed = new Map(); // abs file -> label shown in the report
  const unmapped = [];
  for (const file of change.files) {
    if (/^packages\/i18n\/messages\/.+\.json$/.test(file)) {
      const keys = changedKeys(root, change, file);
      let hit = 0;
      for (const [src, code] of text) {
        if (!keys.some((k) => readsKey(code, k))) continue;
        hit++;
        if (!changed.has(src)) changed.set(src, `${path.basename(src)} (matn)`);
      }
      if (keys.length && !hit) unmapped.push(`${file}: ${keys.length} kalit o'zgargan, o'qiydigan kod topilmadi`);
    } else if (/^(apps|packages)\/[^/]+\/(src|styles)\//.test(file)) changed.set(abs(file), path.basename(file));
  }

  const out = { base: change.base, mergeBase: change.mergeBase, files: change.files, unmapped, apps: {} };
  const all = apps.flatMap((app) => appRoutes(root, app).map((r) => ({ ...r, reach: closure(graph, r.entries) })));
  // How many routes each changed file reaches: the fewer, the more that change is "about" those routes.
  const breadth = new Map();
  for (const f of changed.keys()) breadth.set(f, all.filter((r) => r.reach.has(f)).length);

  for (const app of apps) {
    const routes = [];
    for (const r of all.filter((x) => x.app === app)) {
      const why = [...changed.keys()].filter((f) => r.reach.has(f)).sort((a, b) => breadth.get(a) - breadth.get(b));
      if (!why.length) continue;
      const match = routePattern(r.route);
      let urls = (seeds[app] ?? []).filter((u) => match.test(u.split("?")[0]));
      const dynamic = r.route.includes("[");
      if (!urls.length && !dynamic) urls = [r.route];
      const score = breadth.get(why[0]);
      routes.push({
        route: r.route,
        urls,
        score,
        direct: why.includes(r.page), // the page file itself changed
        shell: r.entries.some((e) => e !== r.page && changed.has(e)), // a layout / loading / error file above it changed
        narrow: why.includes(r.page) || score <= NARROW,
        why: [...new Set(why.map((f) => changed.get(f)))].slice(0, 4),
        noSeed: !urls.length,
      });
    }
    // A changed page file first, then by how narrow the change is.
    routes.sort((a, b) => Number(b.direct) - Number(a.direct) || a.score - b.score || a.route.localeCompare(b.route));
    // Best first: the routes the change is about, then their other variants (?state=…, other ids),
    // then the routes that merely import something shared, then those routes' variants.
    const urls = [];
    for (const narrow of [true, false]) {
      for (const first of [true, false]) {
        const group = routes.filter((r) => r.narrow === narrow);
        const from = first ? 0 : 1;
        const to = first ? 1 : Math.max(0, ...group.map((r) => r.urls.length));
        for (let i = from; i < to; i++) for (const r of group) if (r.urls[i]) urls.push({ url: r.urls[i], route: r.route, why: r.why });
      }
    }
    // App-wide files nothing imports: every page of the app runs through them.
    const appWide = change.files.filter((f) => new RegExp(`^apps/${app}/(src/proxy\\.ts|src/i18n/|next\\.config\\.|public/)`).test(f));
    out.apps[app] = { routes, urls, appWide };
  }
  return out;
}
