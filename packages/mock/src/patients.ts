import type { Appointment, DoctorProfile, User } from "@projectx/types";
import { getDoctorAppointments, getPatientAppointments } from "./appointments";
import { getDoctorById } from "./doctors";
import { getUrgentRecords } from "./records";
import { getUserById } from "./users";

export interface DoctorPatient {
  user: User;
  appointments: Appointment[];
  nextVisit?: Appointment;
  lastVisit?: Appointment;
  hasActive: boolean;
  /** The notebook holds an approved entry a doctor flagged "urgent". */
  hasUrgent: boolean;
}

/** Patients of a doctor derived from their appointments (mock). */
export function getDoctorPatients(doctorId: string): DoctorPatient[] {
  const byPatient = new Map<string, Appointment[]>();
  for (const a of getDoctorAppointments(doctorId)) {
    byPatient.set(a.patientId, [...(byPatient.get(a.patientId) ?? []), a]);
  }
  const out: DoctorPatient[] = [];
  for (const [pid, list] of byPatient) {
    const user = getUserById(pid);
    if (!user) continue;
    const sorted = [...list].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    const nextVisit = sorted.find((a) => a.status === "scheduled");
    const lastVisit = [...sorted].reverse().find((a) => a.status === "completed");
    out.push({ user, appointments: sorted, nextVisit, lastVisit, hasActive: Boolean(nextVisit), hasUrgent: getUrgentRecords(pid).length > 0 });
  }
  return out.sort((a, b) => Number(b.hasActive) - Number(a.hasActive) || a.user.lastName.localeCompare(b.user.lastName));
}

export function ageFromBirthDate(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

/**
 * Doctors a patient may "ask about an entry": those of upcoming appointments first, then of past visits,
 * most recent first, each doctor once.
 */
export function getPatientDoctors(patientId: string): DoctorProfile[] {
  const list = getPatientAppointments(patientId)
    .filter((a) => a.status === "scheduled" || a.status === "completed")
    .sort((a, b) => Number(b.status === "scheduled") - Number(a.status === "scheduled") || `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const seen = new Set<string>();
  const out: DoctorProfile[] = [];
  for (const a of list) {
    if (seen.has(a.doctorId)) continue;
    seen.add(a.doctorId);
    const d = getDoctorById(a.doctorId);
    if (d) out.push(d);
  }
  return out;
}
