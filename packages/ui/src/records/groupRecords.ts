import type { MedicalRecord, RecordSeverity, RecordType } from "@projectx/types";

/** Sections a reader can filter by (toolbar chips, print dialog). */
export const recordSections = ["analysis", "imaging", "history", "summary"] as const;
export type RecordSection = (typeof recordSections)[number];
/** "flagged" has no chip: it is reached from the "N urgent, M need attention" line under the cover. */
export type RecordFilter = "all" | "flagged" | RecordSection;

export const severities: RecordSeverity[] = ["normal", "attention", "urgent"];

/** Entries the doctor marked "attention" or "urgent"; only approved ones count. */
export function isFlagged(r: MedicalRecord): boolean {
  return r.status === "approved" && (r.severity === "urgent" || r.severity === "attention");
}

export function flaggedCounts(records: MedicalRecord[]): { urgent: number; attention: number } {
  let urgent = 0;
  let attention = 0;
  for (const r of records) {
    if (r.status !== "approved") continue;
    if (r.severity === "urgent") urgent++;
    else if (r.severity === "attention") attention++;
  }
  return { urgent, attention };
}

export const printPeriods = ["3m", "6m", "1y", "all"] as const;
export type PrintPeriod = (typeof printPeriods)[number];

/** Allergies and regular medication are a standing state, not dated events: they live on the cover. */
const coverTypes: RecordType[] = ["allergy", "medication"];

/** "other" entries have no chip of their own; when printing by section they go with the illness history. */
export function sectionOf(type: RecordType): RecordSection | null {
  if (type === "other") return "history";
  return (recordSections as readonly string[]).includes(type) ? (type as RecordSection) : null;
}

export function coverItems(records: MedicalRecord[], type: "allergy" | "medication"): MedicalRecord[] {
  return records.filter((r) => r.type === type && !r.private);
}

/** Dated entries, newest first. */
export function timeline(records: MedicalRecord[]): MedicalRecord[] {
  return records.filter((r) => !coverTypes.includes(r.type)).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

/** Toolbar chip: "all" keeps everything, a section keeps exactly that record type, "flagged" the doctor-flagged ones. */
export function byFilter(records: MedicalRecord[], filter: RecordFilter): MedicalRecord[] {
  if (filter === "all") return records;
  if (filter === "flagged") return records.filter(isFlagged);
  return records.filter((r) => r.type === filter);
}

/** `YYYY-MM-DD` of the first day inside the period, or null for "all". */
export function periodStart(period: PrintPeriod, today: string): string | null {
  if (period === "all") return null;
  const d = new Date(`${today}T00:00:00`);
  if (period === "3m") d.setMonth(d.getMonth() - 3);
  else if (period === "6m") d.setMonth(d.getMonth() - 6);
  else d.setFullYear(d.getFullYear() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------- search and date range (toolbar, `?q=&from=&to=`) ----------
export interface RecordQuery {
  q: string;
  /** Inclusive `YYYY-MM-DD` bounds; empty means open-ended. */
  from: string;
  to: string;
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** Read `?q=&from=&to=`; malformed dates are dropped rather than trusted. */
export function parseRecordQuery(get: (key: string) => string | null | undefined): RecordQuery {
  const date = (v: string | null | undefined) => (v && isoDate.test(v) ? v : "");
  return { q: (get("q") ?? "").trim(), from: date(get("from")), to: date(get("to")) };
}

/** Which quick chip a range corresponds to ("custom" for anything typed in by hand). */
export function rangePreset(from: string, to: string, today: string): PrintPeriod | "custom" {
  if (!from && !to) return "all";
  if (to) return "custom";
  return printPeriods.find((p) => p !== "all" && periodStart(p, today) === from) ?? "custom";
}

const fold = (s: string) => s.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f'‘’ʻʼ`]/g, "");

/** Text the search looks at: title, text, the doctor's name and lab value names. */
function searchableText(r: MedicalRecord): string {
  return [r.title, r.description, r.authorName, ...(r.values ?? []).map((v) => v.name)]
    .filter(Boolean)
    .join("\n");
}

export function matchesSearch(r: MedicalRecord, q: string): boolean {
  if (!q) return true;
  const hay = fold(searchableText(r));
  return fold(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

export function inRange(r: MedicalRecord, from: string, to: string): boolean {
  return (!from || r.date >= from) && (!to || r.date <= to);
}

/**
 * Where `q`'s words occur in `text`, as [start, end) pairs, for highlighting.
 * Matching ignores case and apostrophe variants (o'/o‘/oʻ), like the search itself.
 */
export function highlightRanges(text: string, q: string): [number, number][] {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length || !text) return [];
  // Fold character by character so positions in the folded string map back to the original.
  const map: number[] = [];
  let folded = "";
  for (let i = 0; i < text.length; i++) {
    const f = fold(text[i]);
    for (let k = 0; k < f.length; k++) map.push(i);
    folded += f;
  }
  const out: [number, number][] = [];
  for (const w of words) {
    let at = folded.indexOf(w);
    while (at >= 0) {
      out.push([map[at], map[at + w.length - 1] + 1]);
      at = folded.indexOf(w, at + w.length);
    }
  }
  out.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of out) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}

export interface MonthGroup {
  key: string; // YYYY-MM
  items: MedicalRecord[];
}

/** Consecutive entries of the same month under one heading (input must already be sorted). */
export function groupByMonth(records: MedicalRecord[]): MonthGroup[] {
  const out: MonthGroup[] = [];
  for (const r of records) {
    const key = r.date.slice(0, 7);
    const last = out[out.length - 1];
    if (last && last.key === key) last.items.push(r);
    else out.push({ key, items: [r] });
  }
  return out;
}

// ---------- printing ----------
export type PrintMode = "full" | "doctor";
export interface PrintOptions {
  period: PrintPeriod;
  /** A hand-picked range (the notebook's "Range" filter); wins over `period` when set. */
  from?: string;
  to?: string;
  sections: RecordSection[];
  mode: PrintMode;
  /** Print just this entry (period and sections are ignored). */
  recordId?: string;
  /** Open the browser's print dialog as soon as the page has loaded. */
  auto: boolean;
}

type Query = { [key: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Read `?period=&sections=&mode=&record=&auto=`; anything missing or unknown falls back to "everything". */
export function parsePrintOptions(sp: Query): PrintOptions {
  const period = one(sp.period);
  const wanted = (one(sp.sections) ?? "").split(",").filter((s): s is RecordSection => (recordSections as readonly string[]).includes(s));
  return {
    period: (printPeriods as readonly string[]).includes(period ?? "") ? (period as PrintPeriod) : "all",
    ...rangeOf(parseRecordQuery((k) => one(sp[k]))),
    sections: wanted.length ? wanted : [...recordSections],
    mode: one(sp.mode) === "doctor" ? "doctor" : "full",
    recordId: one(sp.record) || undefined,
    auto: one(sp.auto) === "1",
  };
}

const rangeOf = ({ from, to }: RecordQuery) => ({ ...(from && { from }), ...(to && { to }) });

export function printQuery(o: Partial<Omit<PrintOptions, "auto">> & { auto?: boolean }): string {
  const q = new URLSearchParams();
  if (o.recordId) q.set("record", o.recordId);
  else {
    if (o.from || o.to) {
      if (o.from) q.set("from", o.from);
      if (o.to) q.set("to", o.to);
    } else if (o.period && o.period !== "all") q.set("period", o.period);
    if (o.sections && o.sections.length < recordSections.length) q.set("sections", o.sections.join(","));
  }
  if (o.mode === "doctor") q.set("mode", "doctor");
  if (o.auto) q.set("auto", "1");
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * What ends up on paper. "doctor" mode = cover + everything not marked private.
 * Entries still under review or rejected never print, whatever the mode.
 */
export function selectForPrint(records: MedicalRecord[], o: PrintOptions, today: string): { cover: MedicalRecord[]; entries: MedicalRecord[] } {
  const visible = records.filter((r) => r.status === "approved" && (o.mode === "full" || !r.private));
  const all = timeline(visible);
  if (o.recordId) return { cover: visible, entries: all.filter((r) => r.id === o.recordId) };
  const custom = Boolean(o.from || o.to);
  const from = custom ? (o.from ?? "") : (periodStart(o.period, today) ?? "");
  const to = custom ? (o.to ?? "") : "";
  return {
    cover: visible,
    entries: all.filter((r) => {
      const s = sectionOf(r.type);
      return s !== null && o.sections.includes(s) && inRange(r, from, to);
    }),
  };
}
