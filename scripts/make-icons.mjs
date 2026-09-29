/**
 * Favicon and PWA icons, drawn from the logo (packages/ui/src/layout/Logo.tsx).
 * Run it again whenever the mark changes:  node scripts/make-icons.mjs
 *
 *   apps/<app>/src/app/icon.svg        the mark, for browsers that take an SVG favicon
 *   apps/<app>/src/app/favicon.ico     16, 32 and 48px
 *   apps/patient/public/icons/*.png    192, 512, maskable 512 and the 180px apple-touch icon
 *
 * Requires Google Chrome (CHROME_PATH to override), like the audit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  process.env.CHROME_PATH ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("Google Chrome not found; set CHROME_PATH");

// The mark and the brand colour are read from the sources, so the icons cannot drift from the logo.
const logo = fs.readFileSync(path.join(ROOT, "packages", "ui", "src", "layout", "Logo.tsx"), "utf8");
const theme = fs.readFileSync(path.join(ROOT, "packages", "ui", "styles", "theme.css"), "utf8");
const BUBBLE = logo.match(/LOGO_BUBBLE =\s*"([^"]+)"/)[1];
const BRAND = theme.match(/--color-primary-500:\s*(#[0-9a-f]{6})/i)[1];
const CROSS = `<rect x="14.2" y="8.5" width="3.6" height="12" rx="1.8"/><rect x="10" y="12.7" width="12" height="3.6" rx="1.8"/>`;

/** The mark on a transparent background: brand bubble, white cross. */
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="${BUBBLE}" fill="${BRAND}"/><g fill="#fff">${CROSS}</g></svg>`;

/**
 * An app icon: the white mark on the brand colour.
 * `scale` is how much of the canvas the mark takes; a maskable icon keeps it inside the safe zone (the middle 80%).
 * `radius` rounds the canvas (0 where the system cuts the shape itself).
 */
const appIconSvg = ({ scale, radius }) => {
  const size = 32 * scale;
  const offset = (32 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radius}" fill="${BRAND}"/><g transform="translate(${offset} ${offset + 0.6 * scale}) scale(${scale})"><path d="${BUBBLE}" fill="#fff"/><g fill="${BRAND}">${CROSS}</g></g></svg>`;
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
async function png(svg, size) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  const buf = await page.screenshot({ type: "png", omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  return Buffer.from(buf);
}

/** An .ico holding PNG images (every browser since IE 11 reads these). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size === 256 ? 0 : size, 0);
    e.writeUInt8(size === 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(path.relative(ROOT, file), `${data.length} B`);
};

try {
  const favicon = ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(markSvg, size) }))));
  for (const app of ["patient", "doctor", "admin"]) {
    write(path.join(ROOT, "apps", app, "src", "app", "icon.svg"), Buffer.from(markSvg + "\n"));
    write(path.join(ROOT, "apps", app, "src", "app", "favicon.ico"), favicon);
  }
  const icons = path.join(ROOT, "apps", "patient", "public", "icons");
  write(path.join(icons, "icon-192.png"), await png(appIconSvg({ scale: 0.62, radius: 7 }), 192));
  write(path.join(icons, "icon-512.png"), await png(appIconSvg({ scale: 0.62, radius: 7 }), 512));
  write(path.join(icons, "icon-maskable-512.png"), await png(appIconSvg({ scale: 0.5, radius: 0 }), 512));
  write(path.join(icons, "apple-touch-icon.png"), await png(appIconSvg({ scale: 0.6, radius: 0 }), 180));
} finally {
  await browser.close();
}
