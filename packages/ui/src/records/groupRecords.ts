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

export const printPeriods = ["3m", "1y", "all"] as const;
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
  else d.setFullYear(d.getFullYear() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    sections: wanted.length ? wanted : [...recordSections],
    mode: one(sp.mode) === "doctor" ? "doctor" : "full",
    recordId: one(sp.record) || undefined,
    auto: one(sp.auto) === "1",
  };
}

export function printQuery(o: Partial<Omit<PrintOptions, "auto">> & { auto?: boolean }): string {
  const q = new URLSearchParams();
  if (o.recordId) q.set("record", o.recordId);
  else {
    if (o.period && o.period !== "all") q.set("period", o.period);
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
  const from = periodStart(o.period, today);
  return {
    cover: visible,
    entries: all.filter((r) => {
      const s = sectionOf(r.type);
      return s !== null && o.sections.includes(s) && (!from || r.date >= from);
    }),
  };
}
