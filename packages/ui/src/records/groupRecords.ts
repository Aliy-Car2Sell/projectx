import type { MedicalRecord, RecordType } from "@projectx/types";

/** Sections a reader can filter by (toolbar chips, print dialog). */
export const recordSections = ["analysis", "imaging", "history", "summary"] as const;
export type RecordSection = (typeof recordSections)[number];
export type RecordFilter = "all" | RecordSection;

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

/** Toolbar chip: "all" keeps everything, a section keeps exactly that record type. */
export function byFilter(records: MedicalRecord[], filter: RecordFilter): MedicalRecord[] {
  return filter === "all" ? records : records.filter((r) => r.type === filter);
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
