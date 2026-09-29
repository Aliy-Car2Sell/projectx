/**
 * Screenshot one page at 375px and 1280px (signed in), for checking a change by eye.
 *
 * Usage:  node scripts/shot.mjs <url> <name> [--scroll <px>] [--click <selector>] [--full]
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

const [url, name, ...rest] = process.argv.slice(2);
if (!url || !name) throw new Error("usage: node scripts/shot.mjs <url> <name> [--scroll px] [--click selector] [--full]");
const opt = (k) => {
  const i = rest.indexOf(`--${k}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const full = rest.includes("--full");

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const width of [375, 1280]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width === 375 ? 740 : 900 });
    const origin = new URL(url).origin;
    await browser.setCookie({ name: "px_session", value: "patient", url: origin });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    const click = opt("click");
    if (click) {
      await page.click(click).catch(() => {});
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
