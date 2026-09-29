import type { Appointment, AppointmentStatus, DoctorSchedule, ScheduleDay } from "@projectx/types";
import { toDate, toIsoDate, weekdayKey } from "@projectx/utils";

export type CalendarView = "list" | "week" | "month";
export const calendarViews: CalendarView[] = ["list", "week", "month"];

export const minutesOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const timeOf = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export function addDays(date: string, days: number): string {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** First day of the month `months` away from `date`'s month. */
export function addMonths(date: string, months: number): string {
  const d = toDate(`${date.slice(0, 7)}-01`);
  d.setMonth(d.getMonth() + months);
  return toIsoDate(d);
}

/** Monday of the week `date` is in. */
export function mondayOf(date: string): string {
  const d = toDate(date);
  return addDays(date, -((d.getDay() + 6) % 7));
}

export const weekOf = (date: string): string[] => Array.from({ length: 7 }, (_, i) => addDays(mondayOf(date), i));

/** The month as whole weeks, Monday first (5 or 6 rows), with the neighbouring months' days filling the edges. */
export function monthWeeks(date: string): string[][] {
  const first = `${date.slice(0, 7)}-01`;
  const last = addDays(addMonths(first, 1), -1);
  const weeks: string[][] = [];
  for (let monday = mondayOf(first); monday <= last; monday = addDays(monday, 7)) weeks.push(weekOf(monday));
  return weeks;
}

export const scheduleDay = (schedule: DoctorSchedule, date: string): ScheduleDay | undefined => schedule.days.find((d) => d.day === weekdayKey(date));

/**
 * The hours the week grid shows: the earliest start to the latest end of the working days,
 * stretched to whole slots around any appointment that falls outside them.
 */
export function gridHours(schedule: DoctorSchedule, appointments: Appointment[]): { start: number; end: number; step: number } {
  const step = schedule.slotDurationMin;
  const working = schedule.days.filter((d) => d.enabled);
  let start = Math.min(...working.map((d) => minutesOf(d.start)), 9 * 60);
  let end = Math.max(...working.map((d) => minutesOf(d.end)), 17 * 60);
  for (const a of appointments) {
    start = Math.min(start, Math.floor(minutesOf(a.time) / step) * step);
    end = Math.max(end, Math.ceil((minutesOf(a.time) + a.durationMin) / step) * step);
  }
  return { start, end, step };
}

export type SlotKind = "free" | "break" | "off";

/** What a slot of the day is when nothing is booked in it. */
export function slotKind(day: ScheduleDay | undefined, minute: number): SlotKind {
  if (!day?.enabled || minute < minutesOf(day.start) || minute >= minutesOf(day.end)) return "off";
  if (day.breakStart && day.breakEnd && minute >= minutesOf(day.breakStart) && minute < minutesOf(day.breakEnd)) return "break";
  return "free";
}

export interface PlacedAppointment {
  appointment: Appointment;
  start: number;
  end: number;
  /** Side-by-side position among appointments that overlap in time. */
  lane: number;
  lanes: number;
}

/** A day's appointments with lanes assigned, so overlapping ones sit next to each other. */
export function placeDay(appointments: Appointment[]): PlacedAppointment[] {
  const sorted = [...appointments].sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
  const placed: PlacedAppointment[] = [];
  let group: PlacedAppointment[] = [];
  let groupEnd = -1;
  const close = () => {
    const lanes = Math.max(...group.map((p) => p.lane)) + 1;
    for (const p of group) p.lanes = lanes;
    group = [];
  };
  for (const appointment of sorted) {
    const start = minutesOf(appointment.time);
    const end = start + appointment.durationMin;
    if (group.length && start >= groupEnd) close();
    const taken = new Set(group.filter((p) => p.end > start).map((p) => p.lane));
    let lane = 0;
    while (taken.has(lane)) lane++;
    const p = { appointment, start, end, lane, lanes: 1 };
    group.push(p);
    placed.push(p);
    groupEnd = Math.max(groupEnd, end);
  }
  if (group.length) close();
  return placed;
}

/** Block colours by status: the 50 as background, the 700 as text (the list view's badges use the same pairs). */
export const statusBlock: Record<AppointmentStatus, string> = {
  scheduled: "bg-primary-50 text-primary-700 border-primary-200",
  completed: "bg-success-50 text-success-700 border-success-500/30",
  cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200 line-through",
  no_show: "bg-danger-50 text-danger-700 border-danger-500/30",
};
/** Dots (month view, legend, the dashboard's timeline): the status 500. */
export const statusDot: Record<AppointmentStatus, string> = {
  scheduled: "bg-primary-500",
  completed: "bg-success-500",
  cancelled: "bg-neutral-300",
  no_show: "bg-danger-500",
};
