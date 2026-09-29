import type { MedicalRecord, MedicationLog, MedicationSchedule, RegularMedication } from "@projectx/types";

/** Quick choices when adding a medicine; anything else is typed in as "other". */
export const dosePresets = [
  { key: "morning", time: "08:00" },
  { key: "noon", time: "13:00" },
  { key: "evening", time: "20:00" },
] as const;

export function isRegularMedication(r: MedicalRecord): r is RegularMedication {
  return r.type === "medication" && r.status !== "deleted" && Boolean(r.schedule?.times.length);
}

export function isActiveOn(s: MedicationSchedule, date: string): boolean {
  return date >= s.startDate && (!s.endDate || date <= s.endDate);
}

export type DoseStatus = "taken" | "missed" | "due";
export interface Dose {
  medication: RegularMedication;
  date: string;
  time: string;
  status: DoseStatus;
}

export const doseKey = (d: { medicationId: string; date: string; time: string }) => `${d.medicationId}|${d.date}|${d.time}`;

function takenSet(logs: MedicationLog[]): Set<string> {
  return new Set(logs.filter((l) => l.takenAt).map(doseKey));
}

/** The doses of one day in time order. `now` ("HH:mm") decides between "due" and "missed" for today. */
export function dosesFor(meds: RegularMedication[], logs: MedicationLog[], date: string, today: string, now: string): Dose[] {
  const taken = takenSet(logs);
  const out: Dose[] = [];
  for (const medication of meds) {
    if (!isActiveOn(medication.schedule, date)) continue;
    for (const time of medication.schedule.times) {
      const done = taken.has(doseKey({ medicationId: medication.id, date, time }));
      const past = date < today || (date === today && time < now);
      out.push({ medication, date, time, status: done ? "taken" : past ? "missed" : "due" });
    }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time) || a.medication.title.localeCompare(b.medication.title));
}

export interface Adherence {
  /** Oldest day first; a day counts as taken only when every dose of it was taken. `null` = not prescribed that day. */
  days: { date: string; taken: boolean | null }[];
  taken: number;
  total: number;
}

/** The last `days` days before today (today is still in progress, so it is left out). */
export function adherence(med: RegularMedication, logs: MedicationLog[], dates: string[]): Adherence {
  const taken = takenSet(logs);
  const days = dates.map((date) => ({
    date,
    taken: isActiveOn(med.schedule, date) ? med.schedule.times.every((time) => taken.has(doseKey({ medicationId: med.id, date, time }))) : null,
  }));
  const counted = days.filter((d) => d.taken !== null);
  return { days, taken: counted.filter((d) => d.taken).length, total: counted.length };
}

/** "HH:mm" sorted and de-duplicated; malformed values are dropped. */
export function normalizeTimes(times: string[]): string[] {
  return [...new Set(times.filter((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)))].sort();
}
