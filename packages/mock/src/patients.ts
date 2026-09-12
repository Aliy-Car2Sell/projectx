import type { Appointment, User } from "@projectx/types";
import { getDoctorAppointments } from "./appointments";
import { getUserById } from "./users";

export interface DoctorPatient {
  user: User;
  appointments: Appointment[];
  nextVisit?: Appointment;
  lastVisit?: Appointment;
  hasActive: boolean;
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
    out.push({ user, appointments: sorted, nextVisit, lastVisit, hasActive: Boolean(nextVisit) });
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
