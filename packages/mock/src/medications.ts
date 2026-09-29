import type { MedicalRecord, MedicationLog, RegularMedication } from "@projectx/types";
import { isoDateFromNow } from "@projectx/utils";
import { getPatientRecords } from "./records";

export function isRegularMedication(r: MedicalRecord): r is RegularMedication {
  return r.type === "medication" && Boolean(r.schedule?.times.length);
}

/** The patient's scheduled medicines (never filtered by "only me": medication is always shared). */
export function getRegularMedications(patientId: string): RegularMedication[] {
  return getPatientRecords(patientId).filter(isRegularMedication);
}

/**
 * Days (counted back from today) on which a dose was skipped, per medicine, so the doctor's
 * adherence dots and the patient's history are not all green.
 */
const missedDaysAgo: Record<string, number[]> = {
  "rec-11": [3],
  "rec-12": [2, 5],
  "rec-23": [1, 4, 6],
};

/** Taken/skipped doses of the last `days` days before today (today itself starts empty). */
export function getMedicationLogs(patientId: string, days = 14): MedicationLog[] {
  const out: MedicationLog[] = [];
  for (const med of getRegularMedications(patientId)) {
    for (let ago = days; ago >= 1; ago--) {
      const date = isoDateFromNow(-ago);
      if (date < med.schedule.startDate || (med.schedule.endDate && date > med.schedule.endDate)) continue;
      const missed = (missedDaysAgo[med.id] ?? []).includes(ago);
      for (const time of med.schedule.times) {
        out.push({ medicationId: med.id, date, time, takenAt: missed ? undefined : `${date}T${time}:00` });
      }
    }
  }
  return out;
}
