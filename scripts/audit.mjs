/**
 * ProjectX UI audit: navigation, buttons, i18n and 375px layout across the three apps.
 *
 * Usage:  pnpm audit:ui [-- --apps patient,doctor --quick --keep]
 *   --apps   comma list of apps to audit (default: patient,doctor,admin)
 *   --quick  skip the button-probing pass
 *   --keep   leave auto-started servers running
 *
 * Each app is audited on its own origin (NEXT_PUBLIC_*_URL from apps/patient/.env).
 * Any origin that is not reachable is started with `next start` from its production build
 * (run `pnpm build` first); all three are needed because cross-app links are fetched.
 * Requires Google Chrome (CHROME_PATH to override).
 *
 * Output: scripts/audit-output/{results.json, summary.json, report.md, screenshots/}
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "scripts", "audit-output");
const LOCALES = ["uz", "ru", "en"];
const VIEWPORTS = { desktop: { width: 1280, height: 900 }, mobile: { width: 375, height: 740 } };

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const APP_FILTER = opt("apps", "patient,doctor,admin").split(",");
const QUICK = flag("quick");

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
const TOP_KEYS = Object.keys(msgs.uz);
const KEY_RE = new RegExp(`(?:^|[^A-Za-z0-9@./_-])(?:${TOP_KEYS.join("|")})\\.[a-zA-Z0-9_]+(?:\\.[a-zA-Z0-9_]+)*(?![A-Za-z0-9@./_-])`, "g");

// ---------- what to visit ----------
const APPS = {
  patient: {
    home: "/patient",
    demo: "demoPatient",
    seeds: [
      "/",
      "/login",
      "/register",
      "/register?role=doctor",
      "/forgot-password",
      "/no-such-page",
      "/patient",
      "/patient/doctors",
      "/patient/doctors/doc-1",
      "/patient/doctors/doc-1/book",
      "/patient/doctors/doc-1/book?reschedule=apt-1",
      "/patient/appointments",
      "/patient/appointments/apt-1",
      "/patient/appointments/apt-4",
      "/patient/appointments/apt-6",
      "/patient/records",
      "/patient/chat",
      "/patient/chat/chat-1",
      "/patient/profile",
      "/patient/review/apt-4",
      "/patient/review/apt-5",
      "/patient/chat/new?with=doc-2",
      "/patient/doctors/doc-1?from=doctor",
      "/patient/doctors/doc-1?from=admin",
    ],
    langPages: ["/login", "/patient/appointments/apt-1", "/patient/doctors?state=empty"],
    profileLang: "/patient/profile",
  },
  doctor: {
    home: "/doctor",
    demo: "demoDoctor",
    seeds: [
      "/",
      "/login",
      "/no-such-page",
      "/doctor",
      "/doctor?state=pending",
      "/doctor/onboarding",
      "/doctor/appointments",
      "/doctor/appointments/apt-1",
      "/doctor/appointments/apt-8",
      "/doctor/appointments/apt-9",
      "/doctor/schedule",
      "/doctor/patients",
      "/doctor/patients/u-patient-1",
      "/doctor/chat",
      "/doctor/chat/dchat-1",
      "/doctor/reviews",
      "/doctor/profile",
      "/doctor/chat/new?with=u-patient-5",
    ],
    langPages: ["/login", "/doctor/patients/u-patient-1"],
    profileLang: "/doctor/profile",
  },
  admin: {
    home: "/admin",
    demo: "demoAdmin",
    seeds: ["/", "/login", "/no-such-page", "/admin", "/admin/applications", "/admin/applications/doc-15", "/admin/applications/doc-18", "/admin/doctors", "/admin/doctors/doc-1", "/admin/reviews", "/admin/users", "/admin/profile"],
    langPages: ["/login", "/admin/applications/doc-15"],
    profileLang: "/admin/profile",
  },
};

// ---------- servers ----------
async function reachable(origin) {
  try {
    const r = await fetch(origin + "/login", { redirect: "manual" });
    return r.status < 500;
  } catch {
    return false;
  }
}
async function ensureServers(apps) {
  const started = [];
  for (const app of apps) {
    if (await reachable(ORIGINS[app])) continue;
    const dir = path.join(ROOT, "apps", app);
    if (!fs.existsSync(path.join(dir, ".next", "BUILD_ID"))) throw new Error(`${app}: ${ORIGINS[app]} is not running and there is no production build. Run \`pnpm build\` (or \`pnpm dev\`) first.`);
    const port = new URL(ORIGINS[app]).port || "80";
    console.log(`starting ${app} on ${ORIGINS[app]}`);
    const proc = spawn(process.execPath, [path.join(dir, "node_modules", "next", "dist", "bin", "next"), "start", "-p", port], { cwd: dir, stdio: "ignore", windowsHide: true });
    started.push(proc);
    for (let i = 0; i < 60 && !(await reachable(ORIGINS[app])); i++) await sleep(500);
    if (!(await reachable(ORIGINS[app]))) throw new Error(`${app} did not come up on ${ORIGINS[app]}`);
  }
  return started;
}

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Wait until streamed content replaced loading.tsx skeletons (networkidle2 fires while the RSC stream is still open). */
async function settle(page) {
  await page
    .waitForFunction(
      () => {
        const m = document.querySelector("main") || document.body;
        const t = (m.innerText || "").trim();
        const pulse = m.querySelector(".animate-pulse");
        const demoLoading = /state=loading/.test(location.search);
        return t.length > 0 && (!pulse || demoLoading);
      },
      { timeout: 15000 },
    )
    .catch(() => {});
  await sleep(150);
}
async function go(page, origin, url) {
  await page.bringToFront().catch(() => {});
  await page.goto(origin + url, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => null);
  await settle(page);
}
const NOISE = [/tile\.openstreetmap/, /pravatar/, /picsum/, /favicon/, /React DevTools/, /net::ERR/, /Failed to load resource/, /ERR_BLOCKED_BY_CLIENT/, /sw\.js/];
const STATIC_RE = /\.(pdf|png|jpe?g|webp|svg|gif|ico|json|xml|txt|webmanifest|js|css)$/i;

const results = []; // per page-load records
const linkChecks = new Map(); // absolute url -> {status, from:Set, crossApp}
const clicks = [];
const screenshots = [];

async function newPage(browser, locale, vp, origin) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.setCookie({ name: "NEXT_LOCALE", value: locale, domain: new URL(origin).hostname, path: "/" });
  await page.evaluateOnNewDocument(() => {
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

async function visit(page, app, url, locale, vpName) {
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
    results.push({ app, url, locale, vp: vpName, status: 0, error: String(e).slice(0, 200) });
    return null;
  }
  await sleep(250);
  const a = await analyze(page, vpName);
  const rec = { app, url, finalUrl, locale, vp: vpName, status, ...a, console: page.__console.slice() };
  delete rec.links;
  results.push(rec);
  const flagged = rec.docOver > 1 || rec.beyond.length || rec.clipped.length || rec.spill.length || rec.keys.length || (rec.isNotFound && url !== "/no-such-page") || (status >= 400 && url !== "/no-such-page") || rec.console.length;
  if (flagged && vpName === "mobile") {
    const file = `screenshots/${app}_${url.replace(/[^a-z0-9]+/gi, "_")}_${locale}.png`;
    try {
      await page.screenshot({ path: path.join(OUT, file), fullPage: false });
      screenshots.push({ app, url, locale, file });
    } catch {}
  }
  return a;
}

async function probeButtons(page, app, url, vpName) {
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
          active: el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-pressed") === "true",
          formInvalid: Boolean(el.form && !el.form.checkValidity()),
          inDialog: Boolean(el.closest('[role="dialog"]')),
          section: (el.closest("section,article,aside,form,li,header,nav")?.querySelector("h1,h2,h3")?.innerText || "").trim().slice(0, 40),
        };
      }),
    );
  const initial = await list();
  const seen = new Set();
  for (const b of initial) {
    if (!b.visible || b.disabled || b.inDialog) continue;
    if (b.haspopup === "listbox" || [...langNames].some((n) => b.text.startsWith(n))) continue; // language switcher tested separately
    if (b.active) continue;
    const sig = `${b.text}|${b.section}|${b.i}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    const cur = await page.evaluate(() => location.pathname + location.search);
    if (cur !== url) await go(page, origin, url);
    const now = await list();
    const target = now[b.i] && now[b.i].text === b.text && now[b.i].visible ? now[b.i] : now.find((x) => x.text === b.text && x.section === b.section && x.visible && !x.disabled);
    if (!target) {
      clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, result: "gone (state changed by earlier click)" });
      continue;
    }
    await page.evaluate(() => {
      window.__fileChooser = false;
    });
    const before = await pageState(page);
    const handles = await page.$$("button");
    const h = handles[target.i];
    if (!h) continue;
    try {
      await h.evaluate((el) => el.click());
    } catch (e) {
      clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, result: "click error " + String(e).slice(0, 80) });
      continue;
    }
    await sleep(450);
    let after;
    try {
      after = await pageState(page);
    } catch {
      await sleep(800);
      after = await pageState(page).catch(() => before);
    }
    const urlChanged = after.url !== before.url;
    const dialogOpened = after.dialog && !before.dialog;
    const dialogClosed = !after.dialog && before.dialog;
    const textChanged = after.text !== before.text;
    const flagsChanged = after.flags !== before.flags;
    let result;
    if (urlChanged) result = `navigates → ${after.url}`;
    else if (after.fileChooser) result = "opens file chooser";
    else if (dialogOpened) result = "opens dialog";
    else if (dialogClosed) result = "closes dialog";
    else if (textChanged || flagsChanged) result = "changes content";
    else if (b.type === "submit" && b.formInvalid) result = "form validation blocks submit (expected)";
    else result = "NO-OP";
    clicks.push({ app, url, vp: vpName, button: b.text, section: b.section, type: b.type, tabRole: b.role, result });
    if (urlChanged) await go(page, origin, url);
    else if (dialogOpened) {
      await page.keyboard.press("Escape");
      await sleep(250);
      if (await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')))) await go(page, origin, url);
    } else if (textChanged) await go(page, origin, url);
  }
}

async function checkLink(absUrl) {
  if (linkChecks.has(absUrl)) return linkChecks.get(absUrl);
  const rec = { status: 0, from: new Set() };
  try {
    const res = await fetch(absUrl, { headers: { cookie: "NEXT_LOCALE=uz" }, redirect: "manual" });
    rec.status = res.status; // notFound() responds with a real 404 in Next
    if (res.status >= 300 && res.status < 400) rec.location = res.headers.get("location");
    await res.text().catch(() => null);
  } catch (e) {
    rec.error = String(e).slice(0, 100);
  }
  linkChecks.set(absUrl, rec);
  return rec;
}

async function demoLogin(browser, app) {
  const page = await newPage(browser, "uz", VIEWPORTS.desktop, ORIGINS[app]);
  const rec = { app, expect: APPS[app].home };
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
    rec.ok = false;
    rec.error = String(e).slice(0, 200);
  }
  await page.close();
  return rec;
}

async function languageSwitch(browser, app) {
  const origin = ORIGINS[app];
  const out = [];
  for (const vpName of ["desktop", "mobile"]) {
    for (const url of APPS[app].langPages) {
      const page = await newPage(browser, "uz", VIEWPORTS[vpName], origin);
      const rec = { app, url, vp: vpName, steps: [] };
      try {
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
      } catch (e) {
        rec.error = String(e).slice(0, 200);
      }
      out.push(rec);
      await page.close();
    }
  }
  // profile page language card
  const page = await newPage(browser, "uz", VIEWPORTS.desktop, origin);
  const url = APPS[app].profileLang;
  const rec = { app, url, vp: "desktop", steps: [] };
  try {
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
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  out.push(rec);
  await page.close();
  return out;
}

// ---------- crawl ----------
async function auditApp(browser, app, log) {
  const origin = ORIGINS[app];
  const cfg = APPS[app];
  const queue = [...cfg.seeds];
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
  const pageD = await newPage(browser, "uz", VIEWPORTS.desktop, origin);
  const pageM = await newPage(browser, "uz", VIEWPORTS.mobile, origin);
  while (queue.length) {
    const url = queue.shift();
    if (done.has(url)) continue;
    done.add(url);
    if (!allowCrawl(url)) continue;
    if (done.size > 80) break;
    log(app, "visit", url);
    const a = await visit(pageD, app, url, "uz", "desktop");
    const am = await visit(pageM, app, url, "uz", "mobile");
    pages.push(url);
    for (const src of [a, am]) {
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
        const rec = await checkLink(absUrl);
        rec.from.add(`${app}:${url} [${l.text || "?"}]`);
        const rel = abs.pathname + abs.search;
        if (targetApp !== app) {
          rec.crossApp = true;
          crossApp.push({ from: url, href: absUrl, text: l.text, targetApp, status: rec.status });
          continue;
        }
        if (STATIC_RE.test(abs.pathname)) continue; // downloads / assets: status checked, not crawled as pages
        if (!done.has(rel) && !queue.includes(rel)) queue.push(rel);
      }
    }
    if (!QUICK) {
      await go(pageD, origin, url);
      await probeButtons(pageD, app, url, "desktop");
      await go(pageM, origin, url);
      await probeButtons(pageM, app, url, "mobile");
    }
  }
  await pageD.close();
  await pageM.close();
  for (const locale of ["ru", "en"]) {
    const pD = await newPage(browser, locale, VIEWPORTS.desktop, origin);
    const pM = await newPage(browser, locale, VIEWPORTS.mobile, origin);
    for (const url of pages) {
      log(app, locale, url);
      await visit(pD, app, url, locale, "desktop");
      await visit(pM, app, url, locale, "mobile");
    }
    await pD.close();
    await pM.close();
  }
  return { pages, crossApp };
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
      const keys = [...new Set(ls.flatMap((l) => l.keys || []))];
      const cons = [...new Set(ls.flatMap((l) => (l.console || []).map((c) => c.text)))];
      const empty = ls.some((l) => l.hasMain && l.mainLen < 20 && !l.isNotFound);
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
    else if (Object.values(perLocale).some((v) => v !== "OK") || uniqMob.length) holat = "Muammo";
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
  let login = "| Ilova | Demo tugmalar | Bosilgach | Natija |\n|---|---|---|---|\n";
  for (const l of R.loginResult) login += `| ${appName[l.app]} | ${esc((l.demoButtons || []).join(", ") || "-")} | \`${l.landed || "-"}\` | ${l.ok ? "OK" : "**Muammo**: " + esc(l.error || `kutilgan ${l.expect}`)} |\n`;

  const summary = {
    apps: Object.keys(R.crawled),
    pages: rows.length,
    pagesWithIssues: rows.filter((r) => !r.holat.startsWith("OK")).length,
    loads: R.results.length,
    clicks: R.clicks.length,
    noops: seenNoop.size,
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
    langOk: R.langResult.every(langOk),
  };
  const reportMd = [
    "## Sahifalar matritsasi\n", md,
    "\n## Buzilgan havolalar\n", badLinks.length ? links : "Yo'q.\n",
    "\n## Ilovalar aro havolalar\n", cross,
    "\n## Ishlamaydigan (NO-OP) tugmalar\n", seenNoop.size ? btn : "Yo'q.\n",
    "\n## Tablar\n", tabMd,
    "\n## Demo kirish\n", login,
    "\n## Til almashtirgich\n", lang,
    "\n## Xulosa\n```json\n" + JSON.stringify(summary, null, 2) + "\n```\n",
  ].join("");
  fs.writeFileSync(path.join(OUT, "report.md"), reportMd);
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT, "findings.json"), JSON.stringify(dyn, null, 2));
  return summary;
}

// ---------- main ----------
async function main() {
  fs.mkdirSync(path.join(OUT, "screenshots"), { recursive: true });
  const t0 = Date.now();
  const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...a);
  // All three origins must be up even when auditing one app: cross-app links are fetched.
  const servers = await ensureServers(Object.keys(APPS));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"] });
  const loginResult = [];
  const langResult = [];
  const crawled = {};
  try {
    for (const app of APP_FILTER) {
      loginResult.push(await demoLogin(browser, app));
      log(app, "demo login", JSON.stringify(loginResult.at(-1)));
      crawled[app] = await auditApp(browser, app, log);
      langResult.push(...(await languageSwitch(browser, app)));
      log(app, "language switch done");
    }
  } finally {
    await browser.close();
    if (!flag("keep")) for (const p of servers) p.kill();
  }
  const links = [...linkChecks.entries()].map(([href, r]) => ({ href, ...r, from: [...r.from] }));
  const R = { loginResult, langResult, crawled, results, links, clicks, screenshots };
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(R, null, 2));
  const summary = report(R);
  log("done:", results.length, "page loads,", clicks.length, "clicks,", links.length, "links");
  console.log(JSON.stringify(summary, null, 2));
  const clean = summary.badLinks === 0 && summary.noops === 0 && summary.keys === 0 && summary.mobile === 0 && summary.consoleErrs === 0 && summary.crossAppBroken === 0 && summary.loginOk && summary.langOk && summary.pagesWithIssues === 0;
  console.log(clean ? "AUDIT CLEAN" : "AUDIT FOUND ISSUES — see scripts/audit-output/report.md");
  process.exit(clean ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
