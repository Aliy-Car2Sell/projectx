/**
 * Deep-merge a partial messages JSON into messages/<bundle>/<locale>.json.
 * Usage: node scripts/merge-messages.mjs <bundle> <locale> <partial.json>
 *   bundle: common | patient | doctor | admin
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [bundle, locale, partialPath] = process.argv.slice(2);
if (!bundle || !locale || !partialPath) {
  console.error("usage: node scripts/merge-messages.mjs <bundle> <locale> <partial.json>");
  process.exit(1);
}

const target = path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../messages/${bundle}/${locale}.json`);
const base = JSON.parse(readFileSync(target, "utf8"));
const partial = JSON.parse(readFileSync(partialPath, "utf8"));

function merge(a, b) {
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object") merge(a[k], v);
    else a[k] = v;
  }
  return a;
}

writeFileSync(target, JSON.stringify(merge(base, partial), null, 2) + "\n");
console.log(`merged ${partialPath} -> ${target}`);
