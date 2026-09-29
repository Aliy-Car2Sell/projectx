/**
 * Screenshot one page at 375px and 1280px (signed in), for checking a change by eye.
 *
 * Usage:  node scripts/shot.mjs <url> <name> [--scroll <px>] [--click <selector>]... [--set <key>=<value>]... [--full]
 *   --click  may repeat; clicks happen in order, after the page has loaded
 *   --set    localStorage entry written before the page loads (repeatable); the first-run guide is
 *            always marked as seen so it does not cover the page
 * Output: scripts/audit-output/shots/<name>-375.png, <name>-1280.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "scripts", "audit-output", "shots");
const CHROME =
  process.env.CHROME_PATH ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find((p) => fs.existsSync(p));

const GUIDE_SEEN = "px_guide_seen=1"; // packages/ui/src/help/FirstRunGuide.tsx
const [url, name, ...rest] = process.argv.slice(2);
if (!url || !name) throw new Error("usage: node scripts/shot.mjs <url> <name> [--scroll px] [--click selector]... [--set key=value]... [--full]");
const all = (k) => rest.flatMap((a, i) => (a === `--${k}` && rest[i + 1] !== undefined ? [rest[i + 1]] : []));
const opt = (k) => all(k)[0];
const storage = [GUIDE_SEEN, ...all("set")].map((kv) => [kv.slice(0, kv.indexOf("=")), kv.slice(kv.indexOf("=") + 1)]);
const full = rest.includes("--full");

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const width of [375, 1280]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width === 375 ? 740 : 900 });
    const origin = new URL(url).origin;
    await browser.setCookie({ name: "px_session", value: "patient", url: origin });
    await page.evaluateOnNewDocument((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v);
    }, storage);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    for (const selector of all("click")) {
      await page.click(selector).catch((e) => console.warn(`click ${selector}: ${e.message}`));
      await new Promise((r) => setTimeout(r, 600));
    }
    const scroll = opt("scroll");
    if (scroll) {
      await page.evaluate((y) => window.scrollTo(0, Number(y)), scroll);
      await new Promise((r) => setTimeout(r, 400));
    }
    const file = path.join(OUT, `${name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: full });
    console.log(path.relative(ROOT, file));
    await page.close();
  }
} finally {
  await browser.close();
}
