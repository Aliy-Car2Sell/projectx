/**
 * ProjectX UI audit: navigation, buttons, i18n and 375px layout across the three apps.
 *
 * Two modes:
 *   quick (default)   pnpm audit:quick    after every stage of work; target ≤ 5 min
 *     The pages this branch touches plus three main pages per app. "Touches" = the files changed
 *     since the branch left `main` (committed or not), followed through the import graph to the
 *     routes that load them (scripts/audit-routes.mjs). uz in both viewports, one page per app in ru.
 *     Links on the visited pages are checked, not followed.
 *   full              pnpm audit:ui       before a merge; target ≤ 12 min
 *     Every seed (scripts/audit-pages.mjs) and every page reachable from one. uz in both viewports;
 *     ru and en at 375px, where a longer translation breaks the layout.
 *
 * Both modes check pages in parallel (`--workers`), each check in a browser context of its own, so
 * what one page leaves in cookies or localStorage never changes what another one sees. If the
 * browser dies it is started again and the checks that were running are repeated.
 *
 * Usage:  node scripts/audit.mjs [--full] [options]
 *   --full        the full audit (without it: quick)
 *   --apps        comma list of apps to audit (default: patient,doctor,admin)
 *   --base        quick: the branch to compare with (default: main)
 *   --max-pages   quick: most pages to check (default 48); the rest is listed as skipped
 *   --workers     pages open at the same time (default 5)
 *   --no-probe    skip the button-probing pass
 *   --no-build    never run `pnpm build`, even if a build is missing or older than the sources
 *   --guest       only run the guest (not signed in) pass and print its checks
 *   --keep        leave auto-started servers running
 *
 * Each app is audited on its own origin (NEXT_PUBLIC_*_URL from apps/patient/.env), against its
 * production build: an origin nothing answers on is built (`turbo run build`, cached) and started with
 * `next start`. All three are needed because cross-app links are fetched. `pnpm dev` may stay running:
 * the audit leaves it alone and serves the production build a thousand ports up (4000 / 4001 / 4002).
 * Requires Google Chrome (CHROME_PATH to override).
 *
 * Output: scripts/audit-output/{results.json, summary.json, report.md, timings.json, screenshots/}
 *         screenshots/ holds only the pages this run flagged.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { APPS } from "./audit-pages.mjs";
import { affectedPages, routePattern } from "./audit-routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "scripts", "audit-output");
const LOCALES = ["uz", "ru", "en"];
// The patient app's mock session cookie (apps/patient/src/lib/session.ts). Pages are audited signed in;
// the guest pass runs in browser contexts without it.
const SESSION_COOKIE = { name: "px_session", value: "patient" };
const VIEWPORTS = { desktop: { width: 1280, height: 900 }, mobile: { width: 375, height: 740 } };

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const MODE = flag("full") ? "full" : "quick";
const APP_FILTER = opt("apps", "patient,doctor,admin").split(",");
const BASE = opt("base", "main");
const MAX_PAGES = Number(opt("max-pages", 48));
const WORKERS = Math.max(1, Number(opt("workers", 5)));
const NO_PROBE = flag("no-probe");
const NO_BUILD = flag("no-build");
const GUEST_ONLY = flag("guest"); // only the guest pass (no crawl), for debugging the login / returnTo flow
/** What each mode is expected to finish in, seconds. */
const TARGET = { quick: 5 * 60, full: 12 * 60 };
/** quick: no new page is started after this many seconds, so the run ends inside its target. */
const QUICK_BUDGET = 4 * 60;

const T0 = Date.now();
const elapsed = () => (Date.now() - T0) / 1000;
const log = (...a) => console.log(`[${elapsed().toFixed(0)}s]`, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** 252 -> "4m 12s" */
const fmtDuration = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, "0")}s` : `${Math.round(s)}s`);

// ---------- origins (no localhost hard-coded here: read the apps' own .env) ----------
function readEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = { ...readEnv(path.join(ROOT, "apps", "patient", ".env")), ...process.env };
const ORIGINS = {
  patient: env.NEXT_PUBLIC_PATIENT_URL,
  doctor: env.NEXT_PUBLIC_DOCTOR_URL,
  admin: env.NEXT_PUBLIC_ADMIN_URL,
};
for (const [app, origin] of Object.entries(ORIGINS)) {
  if (!origin) throw new Error(`NEXT_PUBLIC_${app.toUpperCase()}_URL is not set (apps/patient/.env)`);
  ORIGINS[app] = origin.replace(/\/+$/, "");
}
const appOfUrl = (u) => Object.entries(ORIGINS).find(([, o]) => u.startsWith(o + "/") || u === o)?.[0] ?? null;

const CHROME =
  env.CHROME_PATH ||
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("Google Chrome not found; set CHROME_PATH");

// ---------- messages (for key detection, demo labels, language names) ----------
const MSG_DIR = path.join(ROOT, "packages", "i18n", "messages");
const msgs = Object.fromEntries(
  LOCALES.map((l) => [
    l,
    Object.assign({}, ...fs.readdirSync(MSG_DIR).map((b) => JSON.parse(fs.readFileSync(path.join(MSG_DIR, b, `${l}.json`), "utf8")))),
  ]),
);
const notFoundTitles = LOCALES.map((l) => msgs[l].states.notFoundTitle);
const langNames = new Set(LOCALES.flatMap((l) => Object.values(msgs[l].lang)));
// Logging out ends the session the crawl depends on; it is exercised on its own in guestFlow.
const logoutLabels = new Set(LOCALES.map((l) => msgs[l].common.logout));
const TOP_KEYS = Object.keys(msgs.uz);
const KEY_RE = new RegExp(`(?:^|[^A-Za-z0-9@./_-])(?:${TOP_KEYS.join("|")})\\.[a-zA-Z0-9_]+(?:\\.[a-zA-Z0-9_]+)*(?![A-Za-z0-9@./_-])`, "g");

// ---------- servers ----------
async function reachable(origin) {
  try {
    const r = await fetch(origin + "/login", { redirect: "manual" });
    return r.status < 500;
  } catch {
    return false;
  }
}
/** `next dev` serves its HMR client with every page; a production build never does. */
async function isDevServer(origin) {
  try {
    const html = await (await fetch(origin + "/login")).text();
    return /hmr-client|webpack-hmr|next-devtools|__nextjs_original-stack-frame/.test(html);
  } catch {
    return false;
  }
}
function newestMtime(dir, newest = 0) {
  if (!fs.existsSync(dir)) return newest;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    newest = e.isDirectory() ? newestMtime(p, newest) : Math.max(newest, fs.statSync(p).mtimeMs);
  }
  return newest;
}
/** "missing", "stale" (a source file is newer than the build) or "ok". */
function buildState(app) {
  const id = path.join(ROOT, "apps", app, ".next", "BUILD_ID");
  if (!fs.existsSync(id)) return "missing";
  const built = fs.statSync(id).mtimeMs;
  const sources = [path.join(ROOT, "apps", app, "src"), ...fs.readdirSync(path.join(ROOT, "packages")).flatMap((p) => ["src", "styles", "messages"].map((d) => path.join(ROOT, "packages", p, d)))];
  return sources.some((d) => newestMtime(d) > built) ? "stale" : "ok";
}
/**
 * Make sure every app answers on its origin, from a production build of the current sources.
 * - Nothing on the origin: build (turbo takes unchanged apps out of its cache in a second) and `next start`.
 * - A dev server on the origin: it is left alone; the production build is built for and started on the
 *   port a thousand above, for every app, so that cross-app links stay inside the audited set.
 * - Anything else already running is used as it is.
 * Returns the processes started here and, per app, what is being audited.
 */
async function ensureServers(apps) {
  const started = [];
  const served = {};
  const notes = [];
  const dev = [];
  for (const app of apps) if ((await reachable(ORIGINS[app])) && (await isDevServer(ORIGINS[app]))) dev.push(app);
  if (dev.length && !NO_BUILD) {
    const busy = dev.map((a) => ORIGINS[a]).join(", ");
    for (const app of apps) {
      const u = new URL(ORIGINS[app]);
      u.port = String(Number(u.port || 80) + 1000);
      ORIGINS[app] = u.origin;
      process.env[`NEXT_PUBLIC_${app.toUpperCase()}_URL`] = u.origin; // cross-app links are baked in at build time
    }
    notes.push(`dev server: ${busy} — tegilmadi; production build ${apps.map((a) => ORIGINS[a]).join(", ")} da tekshirildi`);
  }
  const down = [];
  for (const app of apps) {
    if (!(await reachable(ORIGINS[app]))) down.push(app);
    else if (await isDevServer(ORIGINS[app])) {
      served[app] = "dev server (already running)";
      notes.push(`${app}: ${ORIGINS[app]} — dev server (--no-build). Audit ishlaydi, lekin sekinroq; vaqti yozib olinmaydi.`);
    } else {
      // Not ours to restart, and there is no telling which build it serves.
      served[app] = "production build (already running)";
      if (buildState(app) !== "ok") notes.push(`${app}: ${ORIGINS[app]} da server ishlab turibdi, manba fayllar esa oxirgi build'dan yangi. Agar u eski build'ni ko'rsatayotgan bo'lsa, audit eski kodni tekshiradi: serverni to'xtatib, qayta yurgizing.`);
    }
  }
  if (down.length) {
    if (NO_BUILD) {
      const missing = down.filter((app) => buildState(app) === "missing");
      if (missing.length) throw new Error(`${missing.join(", ")}: not running and there is no production build. Run \`pnpm build\` first (or drop --no-build).`);
      const stale = down.filter((app) => buildState(app) === "stale");
      if (stale.length) notes.push(`${stale.join(", ")}: manba fayllar build'dan yangi va --no-build berilgan: audit eski kodni tekshiradi.`);
    } else {
      const t = Date.now();
      log("build", down.join(", "));
      const r = spawnSync("pnpm", ["turbo", "run", "build", ...down.map((a) => `--filter=${a}`)], { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
      if (r.status !== 0) throw new Error(`pnpm build failed:\n${(r.stdout || "").slice(-2000)}\n${(r.stderr || "").slice(-2000)}`);
      notes.push(`build: ${fmtDuration((Date.now() - t) / 1000)} (${down.join(", ")})`);
    }
  }
  await Promise.all(
    down.map(async (app) => {
      const dir = path.join(ROOT, "apps", app);
      const port = new URL(ORIGINS[app]).port || "80";
      log(`starting ${app} on ${ORIGINS[app]}`);
      const proc = spawn(process.execPath, [path.join(dir, "node_modules", "next", "dist", "bin", "next"), "start", "-p", port], { cwd: dir, stdio: "ignore", windowsHide: true });
      started.push(proc);
      for (let i = 0; i < 60 && !(await reachable(ORIGINS[app])); i++) await sleep(500);
      if (!(await reachable(ORIGINS[app]))) throw new Error(`${app} did not come up on ${ORIGINS[app]}`);
      served[app] = "production build";
    }),
  );
  return { started, served, notes };
}

// ---------- helpers ----------
/** Wait until streamed content replaced loading.tsx skeletons (networkidle2 fires while the RSC stream is still open). */
async function settle(page) {
  // waitForFunction throws synchronously on a frame detached by a redirect, so .catch() alone is not enough.
  try {
    await page.waitForFunction(
      () => {
        const m = document.querySelector("main") || document.body;
        const t = (m.innerText || "").trim();
        const pulse = m.querySelector(".animate-pulse");
        const demoLoading = /state=loading/.test(location.search);
        return t.length > 0 && (!pulse || demoLoading);
      },
      { timeout: 15000 },
    );
  } catch {}
  await sleep(150);
}
async function go(page, origin, url) {
  await page.bringToFront().catch(() => {});
  await page.goto(origin + url, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => null);
  await settle(page);
}
const NOISE = [/tile\.openstreetmap/, /pravatar/, /picsum/, /favicon/, /React DevTools/, /net::ERR/, /Failed to load resource/, /ERR_BLOCKED_BY_CLIENT/, /sw\.js/];
const STATIC_RE = /\.(pdf|png|jpe?g|webp|svg|gif|ico|json|xml|txt|webmanifest|js|css)$/i;

// ---------- engine: parallel checks, each in a browser context of its own ----------
const results = []; // per page-load records
const linkChecks = new Map(); // absolute url -> {status, from:Set, crossApp}
const clicks = [];
const screenshots = [];
const tabReplacements = []; // checks that were run again because their tab or the browser died
/** The tab or the whole browser is gone (as opposed to the page misbehaving). */
const DEAD_RE = /detached Frame|Target closed|Session closed|Protocol error|Connection closed|Navigating frame was detached|disconnected/i;

/** What one check found. It is added to the totals only when the check finished, so a repeated check never counts twice. */
const newSink = () => ({ results: [], clicks: [], screenshots: [] });
function commit(sink) {
  results.push(...sink.results);
  clicks.push(...sink.clicks);
  screenshots.push(...sink.screenshots);
}

/** The browser, started on first use and again whenever it has died. */
const host = {
  browser: null,
  launching: null,
  launches: 0,
  async get() {
    if (this.browser?.connected) return this.browser;
    this.launching ??= puppeteer
      .launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"] })
      .then((b) => {
        if (this.launches++ > 0) log(`browser restarted (${this.launches - 1})`);
        this.browser = b;
        return b;
      })
      .finally(() => (this.launching = null));
    return this.launching;
  },
  async close() {
    await this.browser?.close().catch(() => {});
  },
};

/** At most `n` of the functions passed to the returned `limit()` run at once; the rest wait in order. */
function limiter(n) {
  let active = 0;
  const waiting = [];
  return async (fn) => {
    if (active >= n) await new Promise((r) => waiting.push(r));
    else active++;
    try {
      return await fn();
    } finally {
      const next = waiting.shift();
      if (next) next(); // hands its slot over
      else active--;
    }
  };
}
const limit = limiter(WORKERS);

/**
 * One check: `fn(context, sink)` in a fresh browser context, as soon as a worker is free.
 * If the tab or the browser dies it is run again, twice at most; then `giveUp(sink, error)` records the failure.
 * Resolves to { sink, value }; nothing reaches the totals until `commit(sink)`.
 */
function task(name, fn, giveUp) {
  return limit(async () => {
    for (let attempt = 0; ; attempt++) {
      const sink = newSink();
      let ctx;
      try {
        ctx = await (await host.get()).createBrowserContext();
        return { sink, value: await fn(ctx, sink) };
      } catch (e) {
        const gaveUp = attempt >= 2;
        log(gaveUp ? "gave up" : "again", name, String(e).slice(0, 100));
        tabReplacements.push({ task: name, error: String(e).slice(0, 160), gaveUp });
        if (gaveUp) {
          const failed = newSink();
          giveUp?.(failed, e);
          return { sink: failed, value: null, error: e };
        }
        if (!DEAD_RE.test(String(e))) await sleep(500);
      } finally {
        await ctx?.close().catch(() => {});
      }
    }
  });
}

/**
 * Map tiles and demo photos come from other people's servers. The audit opens hundreds of pages at once:
 * that is no way to treat a free tile server, and when it answers slowly a page never settles. They are
 * answered here with a one-pixel image instead, so a run does not depend on the network. Everything else,
 * the apps' own images included, is fetched as usual and the page cache stays on.
 */
const EXTERNAL_IMAGES = ["*://tile.openstreetmap.org/*", "*://*.tile.openstreetmap.org/*", "*://i.pravatar.cc/*", "*://picsum.photos/*", "*://*.picsum.photos/*"];
const PIXEL = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
async function stubExternalImages(page) {
  const cdp = await page.createCDPSession();
  cdp.on("Fetch.requestPaused", (e) => {
    const headers = [
      { name: "content-type", value: "image/png" },
      { name: "access-control-allow-origin", value: "*" },
      { name: "cache-control", value: "max-age=3600" },
    ];
    cdp.send("Fetch.fulfillRequest", { requestId: e.requestId, responseCode: 200, responseHeaders: headers, body: PIXEL }).catch(() => {});
  });
  await cdp.send("Fetch.enable", { patterns: EXTERNAL_IMAGES.map((urlPattern) => ({ urlPattern })) });
}

/** A tab in `browser` (a BrowserContext); `guest` leaves the session cookie out. */
async function newPage(browser, locale, vp, origin, { guest = false } = {}) {
  const page = await browser.newPage();
  // A fresh context answers a permission request only after a random delay, as an incognito window does.
  // Decide at once (denied), so a button that asks for one reacts within the probe's wait.
  await page.browserContext().overridePermissions(origin, []);
  await page.setViewport(vp);
  await stubExternalImages(page);
  const domain = new URL(origin).hostname;
  await page.setCookie({ name: "NEXT_LOCALE", value: locale, domain, path: "/" });
  if (!guest) await page.setCookie({ ...SESSION_COOKIE, domain, path: "/" });
  await page.evaluateOnNewDocument(() => {
    // Print routes call window.print() (on load with &auto=1, and from their "print" button): record it instead of blocking.
    window.print = () => {
      window.__printed = true;
    };
    const orig = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      if (this.type === "file") {
        window.__fileChooser = true;
        return;
      }
      return orig.call(this);
    };
  });
  page.__console = [];
  page.on("console", (m) => {
    const type = m.type();
    if (type === "error" || type === "warning") {
      const text = m.text();
      if (NOISE.some((r) => r.test(text))) return;
      page.__console.push({ type, text: text.slice(0, 300) });
    }
  });
  page.on("pageerror", (e) => page.__console.push({ type: "pageerror", text: String(e).slice(0, 300) }));
  page.on("requestfailed", (r) => {
    const u = r.url();
    // Aborted requests are cancelled RSC prefetches (navigation moved on), not failures.
    if (r.failure()?.errorText === "net::ERR_ABORTED") return;
    if (/\.(png|jpg|jpeg|webp|svg|gif|ico)(\?|$)/.test(u) || NOISE.some((x) => x.test(u))) return;
    page.__console.push({ type: "requestfailed", text: `${u} ${r.failure()?.errorText ?? ""}`.slice(0, 300) });
  });
  return page;
}

async function pageState(page) {
  return page.evaluate(() => ({
    url: location.pathname + location.search,
    text: document.body.innerText,
    dialog: Boolean(document.querySelector('[role="dialog"]')),
    fileChooser: window.__fileChooser === true,
    printed: window.__printed === true,
    flags: [...document.querySelectorAll("[aria-selected],[aria-pressed],[aria-checked],[aria-expanded]")]
      .map((e) => (e.getAttribute("aria-selected") ?? "") + (e.getAttribute("aria-pressed") ?? "") + (e.getAttribute("aria-checked") ?? "") + (e.getAttribute("aria-expanded") ?? ""))
      .join(""),
  }));
}

async function analyze(page, vpName) {
  return page.evaluate(
    ({ notFoundTitles, keyReSrc, vpName }) => {
      const KEY_RE = new RegExp(keyReSrc, "g");
      const bodyText = document.body.innerText || "";
      const main = document.querySelector("main");
      const mainText = (main?.innerText || "").trim();
      const isNotFound = notFoundTitles.some((t) => bodyText.includes(t));
      const keys = [...new Set((bodyText.match(KEY_RE) || []).map((s) => s.trim()))];
      const title = (document.querySelector("h1")?.innerText || "").trim().slice(0, 80);
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== "hidden" && cs.display !== "none";
      };
      const links = [...document.querySelectorAll("a[href]")]
        .filter((a) => !a.closest(".leaflet-container"))
        .map((a) => ({ href: a.getAttribute("href"), text: (a.innerText || a.getAttribute("aria-label") || a.title || "").trim().replace(/\s+/g, " ").slice(0, 50), visible: visible(a) }));
      const unnamed = [...document.querySelectorAll("a,button")].filter((el) => visible(el) && !(el.innerText || "").trim() && !el.getAttribute("aria-label") && !el.title).length;
      const vw = document.documentElement.clientWidth;
      const docOver = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw;
      const beyond = [];
      const clipped = [];
      const describe = (el) => ({ tag: el.tagName.toLowerCase(), cls: String(el.className || "").slice(0, 70), text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 50) });
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest(".leaflet-container") || el.closest("nextjs-portal")) continue;
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.right > vw + 1 && r.left < vw) {
          let p = el.parentElement,
            inScroller = false;
          while (p) {
            if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowX)) {
              inScroller = true;
              break;
            }
            p = p.parentElement;
          }
          if (!inScroller && beyond.length < 6) beyond.push({ ...describe(el), right: Math.round(r.right) });
        }
        if (r.right > vw + 1 && r.left >= vw) continue;
        if (/hidden/.test(cs.overflowX) && cs.textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2 && (el.innerText || "").trim() && clipped.length < 6) {
          clipped.push({ ...describe(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
        }
      }
      const spill = [];
      for (const el of document.querySelectorAll("button, a, span, [class*='badge'], [class*='rounded-full']")) {
        if (!visible(el) || el.closest(".leaflet-container")) continue;
        if (!/nowrap/.test(getComputedStyle(el).whiteSpace)) continue;
        const r = el.getBoundingClientRect();
        const pcs = el.parentElement ? getComputedStyle(el.parentElement) : null;
        if (pcs && /(auto|scroll)/.test(pcs.overflowX)) continue;
        const pr = el.parentElement?.getBoundingClientRect();
        if (pr && r.right > pr.right + 2 && spill.length < 6) spill.push({ ...describe(el), over: Math.round(r.right - pr.right) });
      }
      return { isNotFound, keys, mainLen: mainText.length, hasMain: Boolean(main), title, links, unnamed, docOver, beyond, clipped, spill, vpName };
    },
    { notFoundTitles, keyReSrc: KEY_RE.source, vpName },
  );
}

/**
 * Load one page and analyse it. `label` keeps guest loads of a URL apart from the signed-in ones in the report.
 * A screenshot is saved only when the load is flagged (and only at 375px, where layout problems show).
 */
async function visit(sink, page, app, url, locale, vpName, label = url) {
  page.__console = [];
  let status = 0;
  let finalUrl = url;
  try {
    await page.bringToFront().catch(() => {});
    const res = await page.goto(ORIGINS[app] + url, { waitUntil: "networkidle2", timeout: 60000 });
    status = res ? res.status() : 0;
    // A redirect (doctor/admin "/" -> /login) reports the final response; note where we landed.
    finalUrl = await page.evaluate(() => location.pathname + location.search);
    await settle(page);
  } catch (e) {
    if (DEAD_RE.test(String(e))) throw e; // the tab or the browser, not the page: the task is run again
    sink.results.push({ app, url: label, locale, vp: vpName, status: 0, error: String(e).slice(0, 200) });
    return null;
  }
  await sleep(250);
  const a = await analyze(page, vpName);
  const rec = { app, url: label, finalUrl, locale, vp: vpName, status, ...a, console: page.__console.slice() };
  delete rec.links;
  sink.results.push(rec);
  const flagged = rec.docOver > 1 || rec.beyond.length || rec.clipped.length || rec.spill.length || rec.keys.length || (rec.isNotFound && url !== "/no-such-page") || (status >= 400 && url !== "/no-such-page") || rec.console.length;
  if (flagged && vpName === "mobile") {
    const file = `screenshots/${app}_${label.replace(/[^a-z0-9]+/gi, "_")}_${locale}.png`;
    try {
      await page.screenshot({ path: path.join(OUT, file), fullPage: false });
      sink.screenshots.push({ app, url, locale, file });
    } catch {}
  }
  return a;
}

/** Run `fn`; if a late navigation detached the frame, reopen `url` and run it once more. */
async function retryNav(page, origin, url, fn) {
  try {
    return await fn();
  } catch {
    await sleep(500);
    await go(page, origin, url);
    return fn();
  }
}

async function probeButtons(sink, page, app, url, vpName) {
  const origin = ORIGINS[app];
  const list = async () =>
    page.$$eval("button", (els) =>
      els.map((el, i) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const visible = (r.width || r.height) && cs.visibility !== "hidden" && cs.display !== "none";
        return {
          i,
          text: (el.innerText || el.getAttribute("aria-label") || el.title || "").trim().replace(/\s+/g, " ").slice(0, 60),
          visible: Boolean(visible),
          disabled: el.disabled,
          type: el.type,
          role: el.getAttribute("role"),
          haspopup: el.getAttribute("aria-haspopup"),
          // an already-selected tab, chip or radio legitimately does nothing when clicked again
          active: el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-pressed") === "true" || el.getAttribute("aria-checked") === "true",
          formInvalid: Boolean(el.form && !el.form.checkValidity()),
          inDialog: Boolean(el.closest('[role="dialog"]')),
          section: (el.closest("section,article,aside,form,li,header,nav")?.querySelector("h1,h2,h3")?.innerText || "").trim().slice(0, 40),
        };
      }),
    );
  const initial = await retryNav(page, origin, url, list);
  const seen = new Set();
  /** One button: click it, classify what changed, restore the page. */
  const probeOne = async (b) => {
    const cur = await page.evaluate(() => location.pathname + location.search);
    if (cur !== url) await go(page, origin, url);
    const now = await list();
    const target = now[b.i] && now[b.i].text === b.text && now[b.i].visible ? now[b.i] : now.find((x) => x.text === b.text && x.section === b.section && x.visible && !x.disabled);
    if (!target) {
      sink.clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, result: "gone (state changed by earlier click)" });
      return;
    }
    await page.evaluate(() => {
      window.__fileChooser = false;
      window.__printed = false;
    });
    const before = await pageState(page);
    const handles = await page.$$("button");
    const h = handles[target.i];
    if (!h) return;
    try {
      await h.evaluate((el) => el.click());
    } catch (e) {
      if (page.isClosed() || !page.browser().connected) throw e;
      sink.clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, result: "click error " + String(e).slice(0, 80) });
      return;
    }
    await sleep(450);
    let after;
    try {
      after = await pageState(page);
    } catch {
      await sleep(800);
      after = await pageState(page).catch((e) => {
        // A dead tab must never pass for "nothing changed": the whole check is run again.
        if (page.isClosed() || !page.browser().connected) throw e;
        return before;
      });
    }
    const urlChanged = after.url !== before.url;
    const dialogOpened = after.dialog && !before.dialog;
    const dialogClosed = !after.dialog && before.dialog;
    const textChanged = after.text !== before.text;
    const flagsChanged = after.flags !== before.flags;
    let result;
    if (urlChanged) result = `navigates → ${after.url}`;
    else if (after.fileChooser) result = "opens file chooser";
    else if (after.printed) result = "opens print dialog";
    else if (dialogOpened) result = "opens dialog";
    else if (dialogClosed) result = "closes dialog";
    else if (textChanged || flagsChanged) result = "changes content";
    else if (b.type === "submit" && b.formInvalid) result = "form validation blocks submit (expected)";
    else result = "NO-OP";
    sink.clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, type: b.type, tabRole: b.role, result });
    if (urlChanged) await go(page, origin, url);
    else if (dialogOpened) {
      await page.keyboard.press("Escape");
      await sleep(250);
      if (await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')))) await go(page, origin, url);
    } else if (textChanged) await go(page, origin, url);
  };
  for (const b of initial) {
    if (!b.visible || b.disabled || b.inDialog) continue;
    if (b.haspopup === "listbox" || [...langNames].some((n) => b.text.startsWith(n))) continue; // language switcher tested separately
    if (b.active) continue;
    if (logoutLabels.has(b.text)) continue;
    const sig = `${b.text}|${b.section}|${b.i}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    // A late navigation from the previous click can detach the frame mid-probe: reopen the page and retry once.
    try {
      await probeOne(b);
    } catch (e1) {
      if (!page.browser().connected) throw e1; // the browser went away: the whole task is run again
      log("probe retry", app, url, `[${b.text}]`, String(e1).slice(0, 120));
      try {
        await sleep(500);
        await go(page, origin, url);
        await probeOne(b);
      } catch (e2) {
        sink.clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, result: "PROBE-ERROR " + String(e2).slice(0, 120) });
        await go(page, origin, url).catch(() => {});
      }
    }
  }
}

const fetchLimit = limiter(8);
/** HTTP status of a link; each URL is fetched once however many pages link to it. */
function checkLink(absUrl) {
  if (!linkChecks.has(absUrl)) {
    const rec = { status: 0, from: new Set() };
    linkChecks.set(absUrl, rec);
    rec.ready = fetchLimit(async () => {
      try {
        const res = await fetch(absUrl, { headers: { cookie: `NEXT_LOCALE=uz; ${SESSION_COOKIE.name}=${SESSION_COOKIE.value}` }, redirect: "manual" });
        rec.status = res.status; // notFound() responds with a real 404 in Next
        if (res.status >= 300 && res.status < 400) rec.location = res.headers.get("location");
        await res.text().catch(() => null);
      } catch (e) {
        rec.error = String(e).slice(0, 100);
      }
    });
  }
  const rec = linkChecks.get(absUrl);
  return rec.ready.then(() => rec);
}

function demoLogin(app) {
  const rec = { app, expect: APPS[app].home };
  return task(
    `${app} demo login`,
    async (ctx) => {
      const page = await newPage(ctx, "uz", VIEWPORTS.desktop, ORIGINS[app], { guest: true });
      try {
        await page.goto(ORIGINS[app] + "/login", { waitUntil: "networkidle2" });
        const labels = await page.$$eval("main a, main button", (els) => els.map((e) => e.innerText.trim()));
        const demoLabels = ["demoPatient", "demoDoctor", "demoAdmin"].map((k) => msgs.uz.auth.login[k]);
        rec.demoButtons = labels.filter((l) => demoLabels.includes(l));
        const wanted = msgs.uz.auth.login[APPS[app].demo];
        const handle = await page.evaluateHandle((label) => [...document.querySelectorAll("a,button")].find((e) => e.innerText.trim() === label), wanted);
        const el = handle.asElement();
        if (!el) throw new Error(`demo button "${wanted}" not found`);
        await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => null), el.click()]);
        await sleep(300);
        rec.landed = await page.evaluate(() => location.pathname);
        rec.ok = rec.landed === rec.expect && rec.demoButtons.length === 1;
      } catch (e) {
        if (DEAD_RE.test(String(e))) throw e;
        rec.ok = false;
        rec.error = String(e).slice(0, 200);
      }
      return rec;
    },
    (_, e) => Object.assign(rec, { ok: false, error: String(e).slice(0, 200) }),
  ).then((r) => r.value ?? rec);
}

/**
 * Guest (not signed in) pass for apps with public pages:
 * - public pages render in all locales / viewports with the plain header (no sidebar / bottom nav outside <main>, a login button);
 * - protected pages redirect to /login?returnTo=<page>;
 * - "book" and "chat" on a doctor profile ask for login / registration and land on the intended page afterwards.
 * Every part is a check of its own, so they run side by side. Resolves to the list of checks, in a fixed order.
 */
async function guestFlow(app) {
  const cfg = APPS[app];
  const origin = ORIGINS[app];
  const here = (page) => page.evaluate(() => location.pathname + location.search);
  const loginUrl = (returnTo) => `/login?returnTo=${encodeURIComponent(returnTo)}`;
  /** Click the first visible link to `href` (desktop and mobile CTAs are separate elements). */
  const clickLink = async (page, href) => {
    const h = await page.evaluateHandle(
      (href) => [...document.querySelectorAll("main a[href]")].find((a) => a.getAttribute("href") === href && a.getClientRects().length > 0),
      href,
    );
    const el = h.asElement();
    if (!el) throw new Error(`visible link ${href} not found`);
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => null), el.evaluate((a) => a.click())]);
    await settle(page);
  };
  const submit = async (page, fill) => {
    await fill();
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => null), page.evaluate(() => document.querySelector("main form button[type=submit]").click())]);
    await settle(page);
  };
  /** One part of the pass: `fn(check, ctx, sink)`; if it cannot be run at all, that is a failed check too. */
  const part = (name, fn) =>
    task(`${app} guest: ${name}`, async (ctx, sink) => {
      const checks = [];
      await fn((n, ok, detail = "") => checks.push({ app, name: n, ok: Boolean(ok), detail: ok ? "" : String(detail).slice(0, 200) }), ctx, sink);
      return checks;
    }).then((r) => ({ sink: r.sink, checks: r.value ?? [{ app, name, ok: false, detail: String(r.error).slice(0, 200) }] }));

  const parts = [];
  // 1. public pages, every locale and viewport
  for (const locale of LOCALES) {
    for (const vpName of ["desktop", "mobile"]) {
      parts.push(
        part(`ochiq sahifalar [${locale}/${vpName}]`, async (check, ctx, sink) => {
          const page = await newPage(ctx, locale, VIEWPORTS[vpName], origin, { guest: true });
          for (const url of cfg.guestPages) {
            const a = await visit(sink, page, app, url, locale, vpName, `${url} (mehmon)`);
            const landed = await here(page);
            check(`${url} ochiq [${locale}/${vpName}]`, a && landed === url && !a.isNotFound, `→ ${landed}`);
            if (url === "/") {
              const find = msgs[locale].landing.findDoctor;
              const l = a?.links.find((x) => x.text === find);
              check(`landing "${find}" → /patient/doctors [${locale}/${vpName}]`, l?.href === "/patient/doctors", l?.href ?? "havola topilmadi");
            } else {
              const shell = await page.evaluate(() => ({ nav: [...document.querySelectorAll("aside, nav")].filter((e) => !e.closest("main")).length, login: [...document.querySelectorAll("header a[href]")].map((x) => x.getAttribute("href")).find((h) => h.startsWith("/login")) }));
              check(`${url} oddiy header [${locale}/${vpName}]`, shell.nav === 0 && shell.login === loginUrl(url), JSON.stringify(shell));
            }
          }
        }),
      );
    }
  }

  // 2. protected pages bounce to login
  parts.push(
    part("himoyalangan sahifalar", async (check, ctx) => {
      const page = await newPage(ctx, "uz", VIEWPORTS.desktop, origin, { guest: true });
      for (const url of cfg.guestProtected) {
        await go(page, origin, url);
        const landed = await here(page);
        check(`${url} → login`, landed === loginUrl(url), `→ ${landed}`);
      }
    }),
  );

  // 3. book / chat from a doctor profile: login, register and demo login all return to the intended page
  const doctorUrl = cfg.guestDoctor;
  const flows = [
    { name: "Qabulga yozilish → login", vp: "desktop", pick: (links) => links.find((h) => h.endsWith("/book")), via: "login" },
    { name: "Yozish (chat) → demo kirish", vp: "mobile", pick: (links) => links.find((h) => h.startsWith("/patient/chat")), via: "demo" },
    { name: "Qabulga yozilish → ro'yxatdan o'tish", vp: "mobile", pick: (links) => links.find((h) => h.endsWith("/book")), via: "register" },
  ];
  for (const f of flows) {
    parts.push(
      part(f.name, async (check, ctx) => {
        const page = await newPage(ctx, "uz", VIEWPORTS[f.vp], origin, { guest: true });
        try {
          await go(page, origin, doctorUrl);
          const target = f.pick(await page.$$eval("main a[href]", (els) => els.map((a) => a.getAttribute("href"))));
          if (!target) throw new Error("target link not found");
          await clickLink(page, target);
          const asked = await here(page);
          check(`${f.name}: login so'raladi [${f.vp}]`, asked === loginUrl(target), `→ ${asked}`);
          if (f.via === "login") {
            await submit(page, async () => {
              await page.type('input[name="email"]', "bemor@example.com");
              await page.type('input[name="password"]', "parol1234");
            });
          } else if (f.via === "demo") {
            await submit(page, async () => {
              // the demo card is the second form on the page; drop the first so `submit` hits it
              await page.evaluate(() => document.querySelector("main form").remove());
            });
          } else {
            await clickLink(page, `/register?returnTo=${encodeURIComponent(target)}`);
            const h = await page.evaluateHandle((label) => [...document.querySelectorAll("main button")].find((b) => b.innerText.includes(label)), msgs.uz.auth.register.patient);
            await h.asElement().click();
            await sleep(200);
            await submit(page, async () => {});
          }
          const landed = await here(page);
          const shell = await page.evaluate(() => [...document.querySelectorAll("aside, nav")].filter((e) => !e.closest("main")).length);
          check(`${f.name}: ${target} ga qaytadi [${f.vp}]`, landed === target && shell > 0, `→ ${landed}, nav=${shell}`);
        } catch (e) {
          if (DEAD_RE.test(String(e))) throw e;
          check(`${f.name} [${f.vp}]`, false, e);
        }
      }),
    );
  }

  // 4. logout ends the session: back on the landing page, protected pages ask for login again
  parts.push(
    part("Chiqish", async (check, ctx) => {
      const page = await newPage(ctx, "uz", VIEWPORTS.desktop, origin);
      try {
        await go(page, origin, cfg.home);
        const h = await page.evaluateHandle((labels) => [...document.querySelectorAll("aside button")].find((b) => labels.includes((b.innerText || b.title || "").trim())), [...logoutLabels]);
        const el = h.asElement();
        if (!el) throw new Error("logout button not found");
        await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => null), el.evaluate((b) => b.click())]);
        await settle(page);
        const landed = await here(page);
        await go(page, origin, cfg.home);
        const again = await here(page);
        check("Chiqish → landing, sessiya tugaydi", landed === "/" && again === loginUrl(cfg.home), `→ ${landed}, keyin ${again}`);
      } catch (e) {
        if (DEAD_RE.test(String(e))) throw e;
        check("Chiqish", false, e);
      }
    }),
  );

  const done = await Promise.all(parts);
  for (const p of done) commit(p.sink);
  return done.flatMap((p) => p.checks);
}

/** The header's language switcher on a few pages (uz → ru, survives a reload) and the profile page's language card (uz → en). */
async function languageSwitch(app) {
  const origin = ORIGINS[app];
  const one = (rec, fn) =>
    task(`${app} language ${rec.url} ${rec.vp}`, async (ctx) => {
      rec.steps = [];
      delete rec.error;
      const page = await newPage(ctx, "uz", VIEWPORTS[rec.vp], origin);
      try {
        await fn(page, rec);
      } catch (e) {
        if (DEAD_RE.test(String(e))) throw e;
        rec.error = String(e).slice(0, 200);
      }
      return rec;
    }).then((r) => r.value ?? { ...rec, error: String(r.error).slice(0, 200) });

  const checks = [];
  for (const vpName of ["desktop", "mobile"]) {
    for (const url of APPS[app].langPages) {
      checks.push(
        one({ app, url, vp: vpName }, async (page, rec) => {
          await go(page, origin, url);
          const h1Before = await page.evaluate(() => document.querySelector("h1")?.innerText || document.body.innerText.slice(0, 80));
          await page.click('button[aria-haspopup="listbox"]');
          await sleep(200);
          const opt = await page.evaluateHandle((label) => [...document.querySelectorAll('[role="option"]')].find((e) => e.innerText.trim() === label), msgs.uz.lang.ru);
          const el = opt.asElement();
          if (!el) throw new Error("ru option not found");
          await el.click();
          let lang = "";
          for (let i = 0; i < 40 && lang !== "ru"; i++) {
            await sleep(200);
            lang = await page.evaluate(() => document.documentElement.lang);
          }
          const after = await page.evaluate(() => ({ url: location.pathname + location.search, h1: document.querySelector("h1")?.innerText || document.body.innerText.slice(0, 80) }));
          rec.steps.push({ step: "switch uz→ru", lang, urlAfter: after.url, stayed: after.url === url, textChanged: after.h1 !== h1Before });
          await page.reload({ waitUntil: "networkidle2" });
          const lang2 = await page.evaluate(() => document.documentElement.lang);
          const cookies = await page.cookies();
          rec.steps.push({ step: "reload", lang: lang2, cookie: cookies.find((c) => c.name === "NEXT_LOCALE")?.value, persisted: lang2 === "ru" });
        }),
      );
    }
  }
  // profile page language card
  const url = APPS[app].profileLang;
  checks.push(
    one({ app, url, vp: "desktop" }, async (page, rec) => {
      await go(page, origin, url);
      const opt = await page.evaluateHandle((label) => [...document.querySelectorAll("main button")].find((e) => e.innerText.trim().startsWith(label)), msgs.uz.lang.en);
      const el = opt.asElement();
      if (!el) throw new Error("en button not found");
      await el.click();
      let lang = "";
      for (let i = 0; i < 40 && lang !== "en"; i++) {
        await sleep(200);
        lang = await page.evaluate(() => document.documentElement.lang);
      }
      const u = await page.evaluate(() => location.pathname);
      rec.steps.push({ step: "profile uz→en", lang, urlAfter: u, stayed: u === url });
    }),
  );
  return Promise.all(checks);
}

// ---------- pages ----------
/**
 * Everything the audit does to one page, started right away: load it in uz at both viewports, press
 * its buttons at both, load it at 375px in each of `locales`. `visits` resolves once the two uz loads
 * are in (the crawl needs their links), `done` when the whole page is.
 * ru / en are loaded at 375px only: that is where a longer translation breaks the layout, and nothing
 * else about a page depends on the language (message keys are the same in every locale: pnpm check-messages).
 */
function auditPage(app, url, { locales = [], deadline = 0 } = {}) {
  const origin = ORIGINS[app];
  // quick: decided when the page's first check gets a worker. A page that was started is always finished.
  let admitted;
  const admit = () => (admitted ??= !deadline || Date.now() < deadline);
  const load = (locale, vp) =>
    task(
      `${app} ${url} ${locale}/${vp}`,
      async (ctx, sink) => (admit() ? visit(sink, await newPage(ctx, locale, VIEWPORTS[vp], origin), app, url, locale, vp) : null),
      (sink, e) => sink.results.push({ app, url, locale, vp, status: 0, error: String(e).slice(0, 200) }),
    );
  const probe = (vp) =>
    task(
      `${app} ${url} buttons/${vp}`,
      async (ctx, sink) => {
        if (!admit()) return;
        const page = await newPage(ctx, "uz", VIEWPORTS[vp], origin);
        await go(page, origin, url);
        await probeButtons(sink, page, app, url, vp);
      },
      (sink, e) => sink.clicks.push({ app, url, vp, button: "(sahifa)", section: "", result: "PROBE-ERROR " + String(e).slice(0, 120) }),
    );
  const uz = [load("uz", "desktop"), load("uz", "mobile")];
  const rest = [...(NO_PROBE ? [] : [probe("desktop"), probe("mobile")]), ...locales.map((l) => load(l, "mobile"))];
  return {
    app,
    url,
    visits: Promise.all(uz).then((r) => r.map((x) => x.value)),
    done: Promise.all([...uz, ...rest]).then((all) => {
      const sinks = all.map((x) => x.sink);
      if (admitted) log(app, url, `${sinks.reduce((n, s) => n + s.results.length, 0)} loads, ${sinks.reduce((n, s) => n + s.clicks.length, 0)} clicks`);
      return { app, url, skipped: !admitted, sinks };
    }),
  };
}

/** Check every link the page shows (each URL is fetched once); returns the same-app pages among them, in page order. */
async function followLinks(app, url, analyses, crossApp) {
  const origin = ORIGINS[app];
  const todo = [];
  for (const src of analyses) {
    if (!src) continue;
    for (const l of src.links) {
      const href = l.href || "";
      if (!href || href === "#") {
        linkChecks.set(`${app}:${url} → ${href || "(empty)"}`, { status: "empty-href", from: new Set([`${app}:${url} [${l.text || "?"}]`]) });
        continue;
      }
      if (href.startsWith("tel:") || href.startsWith("mailto:")) continue;
      let abs;
      try {
        abs = new URL(href, origin);
      } catch {
        continue;
      }
      const absUrl = abs.origin + abs.pathname + abs.search;
      const targetApp = appOfUrl(absUrl);
      if (!targetApp) continue; // external site (e.g. OpenStreetMap attribution)
      todo.push({ l, abs, absUrl, targetApp });
    }
  }
  await Promise.all(todo.map((t) => checkLink(t.absUrl)));
  const found = [];
  for (const { l, abs, absUrl, targetApp } of todo) {
    const rec = linkChecks.get(absUrl);
    rec.from.add(`${app}:${url} [${l.text || "?"}]`);
    if (targetApp !== app) {
      rec.crossApp = true;
      crossApp.push({ from: url, href: absUrl, text: l.text, targetApp, status: rec.status });
      continue;
    }
    if (STATIC_RE.test(abs.pathname)) continue; // downloads / assets: status checked, not crawled as pages
    found.push(abs.pathname + abs.search);
  }
  return found;
}

/**
 * full: the seeds and every page reachable from them, wave by wave. A wave is checked in parallel, but
 * its links are read in page order, so the crawl finds the same pages in the same order on every run.
 */
async function crawl(app) {
  const queue = [...APPS[app].seeds];
  const done = new Set();
  const crossApp = [];
  const patternCount = new Map();
  const patternOf = (u) => u.replace(/(doc|apt|chat|dchat|rec|rev|u-patient|u-doctor|act)-\d+/g, "$1-:id");
  const allowCrawl = (u) => {
    const k = patternOf(u);
    if (k === u) return true;
    const n = patternCount.get(k) ?? 0;
    if (n >= 2) return false;
    patternCount.set(k, n + 1);
    return true;
  };
  const pages = [];
  while (queue.length) {
    const wave = [];
    while (queue.length) {
      const url = queue.shift();
      if (done.has(url)) continue;
      done.add(url);
      if (!allowCrawl(url)) continue;
      if (done.size > 80) {
        queue.length = 0;
        break;
      }
      wave.push(auditPage(app, url, { locales: ["ru", "en"] }));
    }
    pages.push(...wave);
    for (const p of wave) for (const rel of await followLinks(app, p.url, await p.visits, crossApp)) if (!done.has(rel) && !queue.includes(rel)) queue.push(rel);
  }
  return { pages, crossApp };
}

/**
 * quick: what to check and why. The apps' main pages first, then the pages the change reaches, the ones
 * it is most about first, one app after the other so that no app waits for another's long list.
 */
function quickPlan(apps) {
  const found = affectedPages(ROOT, apps, Object.fromEntries(apps.map((a) => [a, APPS[a].seeds])), BASE);
  const why = new Map(apps.flatMap((a) => found.apps[a].urls.map((u) => [`${a}|${u.url}`, u.why])));
  const list = [];
  const add = (app, url, kind) => {
    if (!list.some((p) => p.app === app && p.url === url)) list.push({ app, url, kind, why: why.get(`${app}|${url}`) ?? [] });
  };
  for (let i = 0; i < 3; i++) for (const app of apps) if (APPS[app].main[i]) add(app, APPS[app].main[i], "main");
  const longest = Math.max(0, ...apps.map((a) => found.apps[a].urls.length));
  const devOnly = (app, url) => (APPS[app].devOnly ?? []).includes(url.split("?")[0]);
  for (let i = 0; i < longest; i++) for (const app of apps) if (found.apps[app].urls[i] && !devOnly(app, found.apps[app].urls[i].url)) add(app, found.apps[app].urls[i].url, "changed");
  const pages = list.slice(0, MAX_PAGES);

  const touched = (re) => found.files.some((f) => re.test(f));
  /** One of `urls` belongs to a route the change is about: its page, a layout above it, or something few pages share. */
  const about = (app, urls) => found.apps[app].routes.some((r) => (r.narrow || r.shell) && urls.some((u) => routePattern(r.route).test(u)));
  return {
    base: found.base,
    mergeBase: found.mergeBase,
    files: found.files,
    unmapped: found.unmapped,
    pages,
    over: list.slice(MAX_PAGES),
    noSeed: apps.flatMap((a) => found.apps[a].routes.filter((r) => r.noSeed).map((r) => ({ app: a, route: r.route, why: r.why }))),
    // ru: per app, the page the change is most about; the app's first main page when nothing changed there
    ru: Object.fromEntries(apps.map((a) => [a, (pages.find((p) => p.app === a && p.kind === "changed") ?? pages.find((p) => p.app === a))?.url])),
    // The guest pass and the language switcher are run when the change can reach them.
    guest: Object.fromEntries(
      apps.map((a) => [a, Boolean(APPS[a].guestPages) && (touched(new RegExp(`^apps/${a}/src/(proxy\\.ts|lib/session|app/\\(auth\\)/)`)) || touched(/^packages\/ui\/src\/(auth\/|layout\/(PublicShell|AuthShell))/) || about(a, [...APPS[a].guestPages, "/login", "/register"]))]),
    ),
    language: Object.fromEntries(apps.map((a) => [a, touched(new RegExp(`^(packages/i18n/src/|apps/${a}/src/i18n/|packages/ui/src/layout/LanguageSwitcher|packages/ui/src/profile/ProfileForm)`))])),
  };
}

// ---------- report ----------
function report(R) {
  const appName = { patient: "Bemor", doctor: "Doktor", admin: "Admin" };
  const byPage = new Map();
  for (const r of R.results) {
    const k = `${r.app}|${r.url}`;
    if (!byPage.has(k)) byPage.set(k, { app: r.app, url: r.url, loads: [] });
    byPage.get(k).loads.push(r);
  }
  const rows = [];
  const dyn = [];
  for (const { app, url, loads } of byPage.values()) {
    const status = loads.find((l) => l.locale === "uz" && l.vp === "desktop")?.status ?? loads[0].status;
    const finalUrl = loads.find((l) => l.finalUrl && l.finalUrl !== url)?.finalUrl;
    const notFound = loads.some((l) => l.isNotFound);
    const expected404 = url === "/no-such-page";
    const perLocale = {};
    for (const loc of LOCALES) {
      const ls = loads.filter((l) => l.locale === loc);
      if (!ls.length) {
        perLocale[loc] = "—"; // not loaded in this mode
        continue;
      }
      const keys = [...new Set(ls.flatMap((l) => l.keys || []))];
      const cons = [...new Set(ls.flatMap((l) => (l.console || []).map((c) => c.text)))];
      // A loading skeleton has no text by design, so ?state=loading is not an "empty page".
      const empty = !/[?&]state=loading/.test(url) && ls.some((l) => l.hasMain && l.mainLen < 20 && !l.isNotFound);
      const errs = [];
      if (keys.length) errs.push(`kalit: ${keys.join(", ")}`);
      if (cons.length) errs.push(`console: ${cons.map((c) => c.slice(0, 80)).join(" | ")}`);
      if (empty) errs.push("bo'sh sahifa");
      perLocale[loc] = errs.length ? errs.join("; ") : "OK";
      for (const e of keys) dyn.push({ app, url, element: "matn", problem: `Tarjima kaliti ko'rinib qoldi: ${e} (${loc})` });
      for (const c of cons) dyn.push({ app, url, element: "console", problem: `${loc}: ${c.slice(0, 160)}` });
      if (empty) dyn.push({ app, url, element: "main", problem: `Sahifa bo'sh (${loc})` });
    }
    const mobIssues = [];
    for (const l of loads.filter((l) => l.vp === "mobile")) {
      if (l.docOver > 1) mobIssues.push(`${l.locale}: gorizontal scroll +${l.docOver}px`);
      for (const b of l.beyond || []) mobIssues.push(`${l.locale}: <${b.tag}> "${b.text}" ekrandan chiqdi (${b.right}px)`);
      for (const b of l.spill || []) mobIssues.push(`${l.locale}: "${b.text}" konteynerdan ${b.over}px chiqdi`);
      for (const b of l.clipped || []) mobIssues.push(`${l.locale}: "${b.text}" kesilib qoldi (${b.scrollWidth}>${b.clientWidth})`);
    }
    const uniqMob = [...new Set(mobIssues)];
    for (const m of uniqMob) dyn.push({ app, url, element: "375px layout", problem: m });
    let holat = "OK";
    if (status >= 400 && !expected404) holat = `HTTP ${status}`;
    else if (notFound && !expected404) holat = "404 sahifa";
    else if (Object.values(perLocale).some((v) => v !== "OK" && v !== "—") || uniqMob.length) holat = "Muammo";
    if (expected404) holat = status === 404 && notFound ? "OK (404 kutilgan)" : "404 sahifa chiqmadi";
    if (finalUrl && holat === "OK") holat = `OK (→ ${finalUrl})`;
    rows.push({ app: appName[app], url, status, uz: perLocale.uz, ru: perLocale.ru, en: perLocale.en, mobile: uniqMob.length ? uniqMob.join("; ") : "OK", holat });
  }
  const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  let md = "| Ilova | URL | HTTP | uz | ru | en | 375px | Holat |\n|---|---|---|---|---|---|---|---|\n";
  for (const r of rows) md += `| ${r.app} | \`${r.url}\` | ${r.status} | ${esc(r.uz)} | ${esc(r.ru)} | ${esc(r.en)} | ${esc(r.mobile)} | **${r.holat}** |\n`;

  const linkOk = (l) => l.status === 200 || (l.status >= 300 && l.status < 400);
  const badLinks = R.links.filter((l) => !linkOk(l));
  let links = "| Havola | HTTP | Qayerdan |\n|---|---|---|\n";
  for (const l of badLinks) links += `| \`${l.href}\` | ${l.status}${l.error ? " " + l.error : ""} | ${esc((l.from || []).slice(0, 3).join("; "))} |\n`;

  let cross = "| Ilova | Sahifa | Havola matni | Boradi | HTTP |\n|---|---|---|---|---|\n";
  const seenCross = new Set();
  for (const [app, c] of Object.entries(R.crawled)) {
    for (const x of c.crossApp) {
      const k = `${app}|${x.from.split("?")[0]}|${x.href}`;
      if (seenCross.has(k)) continue;
      seenCross.add(k);
      cross += `| ${appName[app]} | \`${x.from}\` | ${esc(x.text || "?")} | \`${x.href}\` (${x.targetApp}) | ${x.status} |\n`;
    }
  }

  const filePickLabels = new Set(LOCALES.flatMap((l) => [msgs[l].profile.changePhoto, msgs[l].doctor.onboarding.uploadPhoto, msgs[l].chat.attach]));
  const noops = R.clicks.filter((c) => c.result === "NO-OP" && !filePickLabels.has(c.button));
  const filePickers = R.clicks.filter((c) => c.result === "opens file chooser" || (c.result === "NO-OP" && filePickLabels.has(c.button)));
  const seenNoop = new Set();
  let btn = "| Ilova | Sahifa | Tugma | Bo'lim | Viewport | Natija |\n|---|---|---|---|---|---|\n";
  for (const c of noops) {
    const k = `${c.app}|${c.url.split("?")[0]}|${c.button}|${c.section}`;
    if (seenNoop.has(k)) continue;
    seenNoop.add(k);
    btn += `| ${appName[c.app]} | \`${c.url}\` | ${esc(c.button || "(ikonka)")} | ${esc(c.section)} | ${c.vp} | hech narsa o'zgarmadi |\n`;
  }
  const tabs = R.clicks.filter((c) => c.tabRole === "tab");
  const seenTab = new Set();
  let tabMd = "| Ilova | Sahifa | Tab | Natija |\n|---|---|---|---|\n";
  for (const c of tabs) {
    const k = `${c.app}|${c.url}|${c.button}`;
    if (seenTab.has(k)) continue;
    seenTab.add(k);
    tabMd += `| ${appName[c.app]} | \`${c.url}\` | ${esc(c.button)} | ${c.result === "NO-OP" ? "**ishlamaydi**" : "OK — " + c.result} |\n`;
  }
  let lang = "| Ilova | Sahifa | Viewport | Natija |\n|---|---|---|---|\n";
  const langOk = (l) => !l.error && l.steps.every((s) => s.stayed !== false && s.persisted !== false && (s.lang === "ru" || s.lang === "en"));
  for (const l of R.langResult) lang += `| ${appName[l.app]} | \`${l.url}\` | ${l.vp} | ${langOk(l) ? "OK" : "**Muammo**: " + esc(l.error || JSON.stringify(l.steps))} |\n`;
  let guest = "| Ilova | Tekshiruv | Natija |\n|---|---|---|\n";
  for (const g of R.guestResult) guest += `| ${appName[g.app]} | ${esc(g.name)} | ${g.ok ? "OK" : "**Muammo**: " + esc(g.detail)} |\n`;
  let login = "| Ilova | Demo tugmalar | Bosilgach | Natija |\n|---|---|---|---|\n";
  for (const l of R.loginResult) login += `| ${appName[l.app]} | ${esc((l.demoButtons || []).join(", ") || "-")} | \`${l.landed || "-"}\` | ${l.ok ? "OK" : "**Muammo**: " + esc(l.error || `kutilgan ${l.expect}`)} |\n`;

  const summary = {
    mode: R.run.mode,
    duration: R.run.duration,
    seconds: R.run.seconds,
    workers: R.run.workers,
    apps: Object.keys(R.crawled),
    pages: rows.length,
    pagesWithIssues: rows.filter((r) => !r.holat.startsWith("OK")).length,
    loads: R.results.length,
    clicks: R.clicks.length,
    noops: seenNoop.size,
    tabReplacements: R.tabReplacements.length,
    browserRestarts: R.run.browserRestarts,
    skippedPages: R.run.skipped.length,
    probeErrors: R.clicks.filter((c) => String(c.result).startsWith("PROBE-ERROR")).length,
    filePickers: filePickers.length,
    tabs: seenTab.size,
    tabsBroken: tabs.filter((c) => c.result === "NO-OP").length,
    links: R.links.length,
    badLinks: badLinks.length,
    crossAppLinks: seenCross.size,
    crossAppBroken: new Set(Object.values(R.crawled).flatMap((c) => c.crossApp).filter((x) => !linkOk(x)).map((x) => x.href)).size,
    keys: dyn.filter((d) => d.problem.startsWith("Tarjima kaliti")).length,
    consoleErrs: dyn.filter((d) => d.element === "console").length,
    mobile: dyn.filter((d) => d.element === "375px layout").length,
    loginOk: R.loginResult.every((l) => l.ok),
    guestChecks: R.guestResult.length,
    guestOk: R.guestResult.every((g) => g.ok),
    langOk: R.langResult.every(langOk),
  };
  const reportMd = [
    runSection(R.run),
    "\n## Sahifalar matritsasi\n", md,
    "\n## Buzilgan havolalar\n", badLinks.length ? links : "Yo'q.\n",
    "\n## Ilovalar aro havolalar\n", cross,
    "\n## Ishlamaydigan (NO-OP) tugmalar\n", seenNoop.size ? btn : "Yo'q.\n",
    "\n## Tablar\n", tabMd,
    "\n## Demo kirish\n", login,
    "\n## Mehmon (loginsiz) oqimi\n", R.guestResult.length ? guest : "Yo'q.\n",
    "\n## Til almashtirgich\n", lang,
    "\n## Xulosa\n```json\n" + JSON.stringify(summary, null, 2) + "\n```\n",
  ].join("");
  fs.writeFileSync(path.join(OUT, "report.md"), reportMd);
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT, "findings.json"), JSON.stringify(dyn, null, 2));
  return summary;
}

/** Top of report.md: how the run went and, for a quick run, what it looked at and why. */
function runSection(run) {
  const appName = { patient: "Bemor", doctor: "Doktor", admin: "Admin" };
  const esc = (s) => String(s).replace(/\|/g, "\\|");
  const over = run.seconds > TARGET[run.mode];
  let md = `# UI audit — ${run.mode} · ${run.duration}\n\n`;
  md += `- Rejim: **${run.mode}**, vaqt **${run.duration}** (maqsad ≤ ${fmtDuration(TARGET[run.mode])}${over ? " — **oshib ketdi**" : ""}); ${run.timingLine}\n`;
  md += `- Parallel sahifalar: ${run.workers}; brauzer qayta ishga tushirildi: ${run.browserRestarts}; qayta bajarilgan tekshiruvlar: ${run.repeated}\n`;
  md += `- Server: ${Object.entries(run.served).map(([a, s]) => `${a} — ${s}`).join("; ")}\n`;
  for (const n of run.notes) md += `- ${n}\n`;
  if (run.plan) {
    const p = run.plan;
    md += `\n## Quick: nima tekshirildi\n\n\`${p.base}\` bilan taqqoslandi (ajralish nuqtasi \`${p.mergeBase.slice(0, 7)}\`): ${p.files.length} fayl o'zgargan, ${p.pages.filter((x) => x.kind === "changed").length} sahifa shu o'zgarishlarga bog'liq.\n\n`;
    md += "| Ilova | Sahifa | Nega |\n|---|---|---|\n";
    for (const x of p.pages) md += `| ${appName[x.app]} | \`${x.url}\` | ${x.kind === "main" && !x.why.length ? "asosiy sahifa" : esc((x.kind === "main" ? "asosiy sahifa; " : "") + x.why.join(", "))} |\n`;
    md += `\nru (375px): ${Object.entries(p.ru).filter(([, u]) => u).map(([a, u]) => `${a} \`${u}\``).join(", ") || "—"}\n`;
    md += `\nMehmon oqimi: ${Object.entries(p.guest).filter(([a]) => APPS[a].guestPages).map(([a, on]) => `${a} — ${on ? "tekshirildi" : "o'tkazib yuborildi (o'zgarish tegmaydi)"}`).join("; ") || "—"}. Til almashtirgich: ${Object.entries(p.language).map(([a, on]) => `${a} — ${on ? "tekshirildi" : "o'tkazib yuborildi"}`).join("; ")}.\n`;
    if (run.skipped.length) {
      md += `\n**Tekshirilmagan sahifalar (${run.skipped.length}) — to'liq audit qamrab oladi:**\n\n| Ilova | Sahifa | Sabab |\n|---|---|---|\n`;
      for (const x of run.skipped) md += `| ${appName[x.app]} | \`${x.url}\` | ${x.reason} |\n`;
    }
    if (p.noSeed.length) {
      md += `\n**Ochib bo'lmadi — seed URL yo'q** (scripts/audit-pages.mjs ga qo'shing):\n\n`;
      for (const x of p.noSeed) md += `- ${appName[x.app]} \`${x.route}\` ← ${esc(x.why.join(", "))}\n`;
    }
    for (const u of p.unmapped) md += `\n- ${esc(u)}\n`;
  }
  return md;
}

// ---------- main ----------
async function main() {
  fs.rmSync(path.join(OUT, "screenshots"), { recursive: true, force: true }); // only this run's flagged pages
  fs.mkdirSync(path.join(OUT, "screenshots"), { recursive: true });
  const quick = MODE === "quick" && !GUEST_ONLY;
  const plan = quick ? quickPlan(APP_FILTER) : null;
  if (plan) {
    log(`quick: ${plan.files.length} files changed since ${plan.base} (${plan.mergeBase.slice(0, 7)}) → ${plan.pages.length} pages${plan.over.length ? `, ${plan.over.length} over --max-pages ${MAX_PAGES}` : ""}`);
    for (const x of plan.noSeed) log(`no seed URL for ${x.app} ${x.route} (changed: ${x.why.join(", ")}): add one to scripts/audit-pages.mjs`);
  }
  // All three origins must be up even when auditing one app: cross-app links are fetched.
  const { started, served, notes } = await ensureServers(Object.keys(APPS));
  for (const n of notes) log("note:", n);

  const loginResult = [];
  const langResult = [];
  const guestResult = [];
  const crawled = {};
  const skipped = plan ? plan.over.map((p) => ({ app: p.app, url: p.url, reason: `--max-pages ${MAX_PAGES} chegarasi` })) : [];
  try {
    // Everything is queued here and run by the workers in this order; nothing below waits for the step before it.
    const logins = APP_FILTER.map((app) => demoLogin(app));
    let pages = [];
    if (quick) {
      const deadline = T0 + QUICK_BUDGET * 1000;
      const crossApp = Object.fromEntries(APP_FILTER.map((a) => [a, []]));
      const planned = plan.pages.map((p) => auditPage(p.app, p.url, { locales: plan.ru[p.app] === p.url ? ["ru"] : [], deadline }));
      pages = APP_FILTER.map(async (app) => {
        const mine = planned.filter((p) => p.app === app);
        for (const p of mine) await followLinks(app, p.url, await p.visits, crossApp[app]); // checked, not followed
        return { app, pages: mine, crossApp: crossApp[app] };
      });
    } else if (!GUEST_ONLY) {
      pages = APP_FILTER.map(async (app) => ({ app, ...(await crawl(app)) }));
    }
    const guests = APP_FILTER.map((app) => (APPS[app].guestPages && (!quick || plan.guest[app]) ? guestFlow(app) : []));
    const langs = APP_FILTER.map((app) => (!GUEST_ONLY && (!quick || plan.language[app]) ? languageSwitch(app) : []));

    for (const r of await Promise.all(logins)) {
      loginResult.push(r);
      log(r.app, "demo login", JSON.stringify(r));
    }
    // Into the totals in a fixed order (app, then page), whatever order the checks finished in.
    for (const { app, pages: list, crossApp } of await Promise.all(pages)) {
      const checked = [];
      for (const p of list) {
        const d = await p.done;
        if (d.skipped) skipped.push({ app, url: p.url, reason: `vaqt chegarasi (${fmtDuration(QUICK_BUDGET)})` });
        else checked.push(p.url);
        for (const sink of d.sinks) commit(sink);
      }
      crawled[app] = { pages: checked, crossApp };
    }
    for (const checks of await Promise.all(guests)) {
      guestResult.push(...checks);
      if (checks.length) log(checks[0].app, "guest flow", `${checks.filter((g) => g.ok).length}/${checks.length} ok`);
      for (const g of checks.filter((g) => !g.ok)) log(g.app, "guest FAIL", g.name, "—", g.detail);
    }
    for (const recs of await Promise.all(langs)) langResult.push(...recs);
  } finally {
    await host.close();
    if (!flag("keep")) for (const p of started) p.kill();
  }

  // ---------- timing ----------
  const seconds = Math.round(elapsed());
  const timingsFile = path.join(OUT, "timings.json");
  let timings = {};
  try {
    timings = JSON.parse(fs.readFileSync(timingsFile, "utf8"));
  } catch {}
  // Only a whole run against production builds is a fair measurement.
  const partial = GUEST_ONLY || NO_PROBE || APP_FILTER.length < Object.keys(APPS).length || Object.values(served).some((s) => s.startsWith("dev"));
  if (!partial) timings[MODE] = { seconds, duration: fmtDuration(seconds), at: new Date().toISOString(), pages: Object.values(crawled).reduce((n, c) => n + c.pages.length, 0), workers: WORKERS };
  fs.writeFileSync(timingsFile, JSON.stringify(timings, null, 2));
  const other = MODE === "quick" ? "full" : "quick";
  const timingLine = [`${MODE}: ${fmtDuration(seconds)}${partial ? " (qisman yurgizish, yozib olinmadi)" : ""}`, timings[other] ? `${other}: ${timings[other].duration} (${timings[other].at.slice(0, 10)})` : `${other}: hali o'lchanmagan`]
    .sort((a, b) => (a.startsWith("quick") ? -1 : b.startsWith("quick") ? 1 : 0))
    .join(", ");

  const links = [...linkChecks.entries()].map(([href, { ready: _, ...r }]) => ({ href, ...r, from: [...r.from] }));
  const run = { mode: MODE, seconds, duration: fmtDuration(seconds), timingLine, workers: WORKERS, browserRestarts: Math.max(0, host.launches - 1), repeated: tabReplacements.length, served, notes, plan, skipped };
  const R = { run, loginResult, langResult, guestResult, tabReplacements, crawled, results, links, clicks, screenshots };
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(R, null, 2));
  const summary = report(R);
  log("done:", results.length, "page loads,", clicks.length, "clicks,", links.length, "links");
  console.log(JSON.stringify(summary, null, 2));
  const clean = summary.badLinks === 0 && summary.noops === 0 && summary.probeErrors === 0 && summary.keys === 0 && summary.mobile === 0 && summary.consoleErrs === 0 && summary.crossAppBroken === 0 && summary.loginOk && summary.guestOk && summary.langOk && summary.pagesWithIssues === 0;
  if (skipped.length) console.log(`${skipped.length} page(s) not checked (see report.md): the full audit covers them.`);
  if (seconds > TARGET[MODE]) console.log(`slower than the target for ${MODE} (${fmtDuration(TARGET[MODE])}).`);
  console.log(timingLine);
  console.log(clean ? `AUDIT CLEAN (${MODE})` : `AUDIT FOUND ISSUES (${MODE}) — see scripts/audit-output/report.md`);
  process.exit(clean ? 0 : 2);
}

main().catch(async (e) => {
  console.error(e);
  await host.close();
  process.exit(1);
});
