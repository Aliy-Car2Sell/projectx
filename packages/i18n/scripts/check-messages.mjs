/**
 * Verify that uz / ru / en have identical key sets in every message bundle
 * (messages/common, messages/patient, messages/doctor, messages/admin).
 * Usage: node scripts/check-messages.mjs   (from packages/i18n, or via `pnpm check-messages`)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MESSAGES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../messages");
const LOCALES = ["uz", "ru", "en"];

const load = (bundle, l) => JSON.parse(fs.readFileSync(path.join(MESSAGES, bundle, `${l}.json`), "utf8"));
const keys = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (typeof v === "object" && v !== null ? keys(v, p + k + ".") : [p + k]));

let ok = true;
let total = 0;
const seen = new Map(); // top-level namespace -> bundle (namespaces must not repeat across bundles)
for (const bundle of fs.readdirSync(MESSAGES)) {
  const uz = new Set(keys(load(bundle, "uz")));
  total += uz.size;
  for (const ns of Object.keys(load(bundle, "uz"))) {
    if (seen.has(ns)) {
      ok = false;
      console.log(`namespace "${ns}" appears in both ${seen.get(ns)} and ${bundle}`);
    }
    seen.set(ns, bundle);
  }
  for (const l of LOCALES.slice(1)) {
    const s = new Set(keys(load(bundle, l)));
    const miss = [...uz].filter((k) => !s.has(k));
    const extra = [...s].filter((k) => !uz.has(k));
    if (miss.length || extra.length) {
      ok = false;
      console.log(`${bundle}/${l}: missing`, miss, "extra", extra);
    }
  }
}
console.log(ok ? `message keys in sync (${total} keys, ${seen.size} namespaces)` : "KEY MISMATCH");
process.exit(ok ? 0 : 1);
