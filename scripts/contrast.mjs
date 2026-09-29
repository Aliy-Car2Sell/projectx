/**
 * Contrast check of the design tokens (packages/ui/styles/theme.css) against WCAG AA.
 *
 * Every pair below is a foreground / background combination the components really use.
 *   text   needs 4.5:1
 *   large  needs 3:1   (headings of 24px+, or 18.66px+ bold)
 *   ui     needs 3:1   (icons, borders of controls, focus ring)
 *   known  below AA on purpose; listed so the number stays in sight, not counted as a failure
 *
 * Usage:  node scripts/contrast.mjs          exit code 1 if a pair fails
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = fs.readFileSync(path.join(ROOT, "packages", "ui", "styles", "theme.css"), "utf8");

// Tokens of the default (patient) theme: the first definition of each --color-* wins, the accent overrides come later.
const raw = {};
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)) raw[m[1]] ??= m[2].trim();
const resolve = (name, accent) => {
  let v = raw[name];
  if (!v) throw new Error(`unknown token --color-${name}`);
  for (let i = 0; i < 8 && v.startsWith("var("); i++) {
    let ref = v.match(/var\(--color-([a-z0-9-]+)\)/)[1];
    if (accent && ref.startsWith("primary-") && name.startsWith("accent")) ref = ref.replace("primary-", `${accent}-`);
    name = ref;
    v = raw[ref];
  }
  return v;
};

const lum = (hex) => {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const NEED = { text: 4.5, large: 3, ui: 3, known: 0 };
/** [foreground, background, kind, where it is used] */
const PAIRS = [
  ["heading", "card", "text", "text on a card"],
  ["heading", "surface", "text", "text on the page"],
  ["muted", "card", "text", "secondary text on a card"],
  ["muted", "surface", "text", "secondary text on the page"],
  ["muted", "primary-50", "text", "secondary text on a tinted block"],
  ["muted", "neutral-100", "text", "inactive tab in the segment"],
  ["neutral-500", "card", "text", "placeholder, caption"],
  ["neutral-500", "surface", "text", "caption on the page"],
  ["primary-900", "surface", "text", "page title"],
  ["primary-600", "surface", "large", "second line of the landing headline (40px+)"],
  ["primary-700", "card", "text", "link, active label"],
  ["primary-700", "surface", "text", "link on the page"],
  ["primary-700", "primary-50", "text", "badge, icon container"],
  ["primary-800", "primary-100", "text", "chip"],
  ["success-700", "success-50", "text", "badge"],
  ["warning-700", "warning-50", "text", "badge"],
  ["danger-700", "danger-50", "text", "badge, error text"],
  ["danger-700", "card", "text", "error under a field"],
  ["teal-700", "teal-50", "text", "doctor accent badge"],
  ["teal-700", "card", "text", "doctor accent text"],
  ["indigo-700", "indigo-50", "text", "admin accent badge"],
  ["indigo-700", "card", "text", "admin accent text"],
  ["card", "neutral-900", "text", "toast, tooltip"],
  ["card", "danger-700", "text", "danger button"],
  ["card", "teal-700", "text", "doctor call-to-action button"],
  ["card", "indigo-600", "text", "admin accent fill"],
  ["card", "primary-700", "text", "primary button (AA variant)"],
  ["card", "primary-500", "ui", "icon on a brand fill (active nav item)"],
  ["card", "teal-500", "ui", "icon on a teal fill"],
  ["card", "indigo-500", "ui", "icon on an indigo fill"],
  ["primary-500", "card", "ui", "focus ring, brand icon"],
  ["primary-700", "primary-50", "ui", "icon in its container"],
  // Below AA on purpose.
  // The brand fill keeps #1a9be6 (docs/audit-2026-09-21-records.md); the label is 16px semibold, so AA asks for 4.5:1.
  ["card", "primary-500", "known", "primary button label on the brand fill"],
  // Stars are decoration: the rating is always written next to them as a number.
  ["star", "card", "known", "rating star"],
];

let failed = 0;
const rows = PAIRS.map(([fg, bg, kind, where]) => {
  const r = ratio(resolve(fg), resolve(bg));
  const ok = r >= NEED[kind];
  if (!ok) failed++;
  const result = kind === "known" ? (r >= 4.5 ? "pass" : "known") : ok ? "pass" : "FAIL";
  return { pair: `${fg} on ${bg}`, ratio: r.toFixed(2), needs: kind === "known" ? "-" : `${NEED[kind]}:1 (${kind})`, result, where };
});
console.table(rows);
console.log(failed ? `${failed} pair(s) below AA` : "all pairs pass AA");
process.exit(failed ? 1 : 0);
