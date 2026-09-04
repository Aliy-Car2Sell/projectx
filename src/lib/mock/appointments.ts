import type { Appointment, DoctorSchedule, Slot } from "@/types";
import { isoDateFromNow } from "@/lib/utils";

/**
 * Appointments are generated relative to today so that "upcoming" and "past"
 * tabs always have content in the mockup.
 */
export const appointments: Appointment[] = [
  // Upcoming for demo patient (u-patient-1)
  {
    id: "apt-1",
    doctorId: "doc-1",
    patientId: "u-patient-1",
    date: isoDateFromNow(0),
    time: "16:30",
    durationMin: 30,
    status: "scheduled",
    reason: "Bosh aylanishi va yurak urishi tezlashuvi",
  },
  {
    id: "apt-2",
    doctorId: "doc-3",
    patientId: "u-patient-1",
    date: isoDateFromNow(3),
    time: "10:00",
    durationMin: 45,
    status: "scheduled",
    reason: "Tish og'rig'i, o'ng tomon",
  },
  {
    id: "apt-3",
    doctorId: "doc-11",
    patientId: "u-patient-1",
    date: isoDateFromNow(9),
    time: "14:00",
    durationMin: 30,
    status: "scheduled",
  },
  // Past for demo patient
  {
    id: "apt-4",
    doctorId: "doc-1",
    patientId: "u-patient-1",
    date: isoDateFromNow(-12),
    time: "11:00",
    durationMin: 30,
    status: "completed",
    reason: "Qon bosimi ko'tarilishi",
    summary: {
      diagnosis: "Arterial gipertoniya, 1-daraja",
      recommendations:
        "Tuzni cheklash, kuniga 30 daqiqa yurish. Amlodipin 5 mg ertalab. 2 haftadan so'ng qon bosimi kundaligi bilan qayta ko'rik.",
      createdAt: isoDateFromNow(-12),
    },
  },
  {
    id: "apt-5",
    doctorId: "doc-5",
    patientId: "u-patient-1",
    date: isoDateFromNow(-30),
    time: "15:30",
    durationMin: 30,
    status: "completed",
    reason: "Teri toshmasi",
    summary: {
      diagnosis: "Allergik dermatit",
      recommendations: "Allergenlarni aniqlash uchun tahlil topshirish. Loratadin 10 mg kuniga 1 marta, 7 kun.",
      createdAt: isoDateFromNow(-30),
    },
    reviewId: "rev-9",
  },
  {
    id: "apt-6",
    doctorId: "doc-2",
    patientId: "u-patient-1",
    date: isoDateFromNow(-45),
    time: "09:20",
    durationMin: 20,
    status: "cancelled",
  },
  // Today's appointments for demo doctor (doc-1)
  {
    id: "apt-7",
    doctorId: "doc-1",
    patientId: "u-patient-2",
    date: isoDateFromNow(0),
    time: "09:00",
    durationMin: 30,
    status: "completed",
    reason: "Nazorat ko'rigi",
    summary: {
      diagnosis: "Yurak ishemik kasalligi, barqaror stenokardiya",
      recommendations: "Davolashni davom ettirish. 1 oydan so'ng EXOKG.",
      createdAt: isoDateFromNow(0),
    },
  },
  {
    id: "apt-8",
    doctorId: "doc-1",
    patientId: "u-patient-3",
    date: isoDateFromNow(0),
    time: "09:30",
    durationMin: 30,
    status: "completed",
    reason: "EKG natijalari bo'yicha maslahat",
  },
  {
    id: "apt-9",
    doctorId: "doc-1",
    patientId: "u-patient-5",
    date: isoDateFromNow(0),
    time: "10:30",
    durationMin: 30,
    status: "no_show",
  },
  {
    id: "apt-10",
    doctorId: "doc-1",
    patientId: "u-patient-6",
    date: isoDateFromNow(0),
    time: "15:00",
    durationMin: 30,
    status: "scheduled",
    reason: "Ko'krak qafasida og'riq",
  },
  {
    id: "apt-11",
    doctorId: "doc-1",
    patientId: "u-patient-4",
    date: isoDateFromNow(1),
    time: "11:00",
    durationMin: 30,
    status: "scheduled",
  },
  {
    id: "apt-12",
    doctorId: "doc-1",
    patientId: "u-patient-2",
    date: isoDateFromNow(2),
    time: "09:30",
    durationMin: 30,
    status: "scheduled",
    reason: "Xolter natijalari",
  },
  {
    id: "apt-13",
    doctorId: "doc-1",
    patientId: "u-patient-3",
    date: isoDateFromNow(4),
    time: "16:00",
    durationMin: 30,
    status: "scheduled",
  },
  {
    id: "apt-14",
    doctorId: "doc-1",
    patientId: "u-patient-5",
    date: isoDateFromNow(-3),
    time: "12:00",
    durationMin: 30,
    status: "completed",
    summary: {
      diagnosis: "Sinusli taxikardiya",
      recommendations: "Kofein va energetik ichimliklarni cheklash. Qalqonsimon bez gormonlari tahlili.",
      createdAt: isoDateFromNow(-3),
    },
  },
  {
    id: "apt-15",
    doctorId: "doc-1",
    patientId: "u-patient-6",
    date: isoDateFromNow(-7),
    time: "10:00",
    durationMin: 30,
    status: "cancelled",
  },
];

export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id);
}

export function getPatientAppointments(patientId: string): Appointment[] {
  return appointments.filter((a) => a.patientId === patientId);
}

export function getDoctorAppointments(doctorId: string): Appointment[] {
  return appointments.filter((a) => a.doctorId === doctorId);
}

/** Demo doctor schedule (used by /doctor/schedule). */
export const doctorSchedule: DoctorSchedule = {
  doctorId: "doc-1",
  slotDurationMin: 30,
  days: [
    { day: "mon", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
    { day: "tue", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
    { day: "wed", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
    { day: "thu", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
    { day: "fri", enabled: true, start: "09:00", end: "15:00", breakStart: "13:00", breakEnd: "14:00" },
    { day: "sat", enabled: false, start: "09:00", end: "13:00" },
    { day: "sun", enabled: false, start: "09:00", end: "13:00" },
  ],
};

/**
 * Generate mock slots for a doctor for the next `days` days.
 * Deterministic pseudo-random booking so the UI looks realistic.
 */
export function generateSlots(doctorId: string, days = 14, durationMin = 30): Slot[] {
  const slots: Slot[] = [];
  for (let d = 0; d < days; d++) {
    const date = isoDateFromNow(d);
    const weekday = new Date(`${date}T00:00:00`).getDay(); // 0 = Sunday
    if (weekday === 0) continue; // closed on Sundays
    const end = weekday === 6 ? 13 * 60 : 17 * 60;
    for (let m = 9 * 60; m < end; m += durationMin) {
      if (m >= 13 * 60 && m < 14 * 60) continue; // lunch break
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const seed = (d * 31 + m / 5 + doctorId.length * 7) % 10;
      slots.push({
        id: `${doctorId}-${date}-${hh}${mm}`,
        doctorId,
        date,
        time: `${hh}:${mm}`,
        isBooked: seed < 4,
      });
    }
  }
  return slots;
}
