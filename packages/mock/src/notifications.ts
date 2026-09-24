import type { UserRole } from "@projectx/types";
import { pendingDoctors } from "./doctors";
import { getRecordById } from "./records";

export type NotificationType =
  | "appointmentReminder"
  | "newMessage"
  | "newRecord"
  | "recordUrgent"
  | "recordAttention"
  | "reviewRequest"
  | "newBooking"
  | "recordUploaded"
  | "newApplication"
  | "reviewReported"
  | "userRegistered";

export interface MockNotification {
  id: string;
  type: NotificationType;
  /** Interpolation values for `notifications.types.<type>`. */
  params: Record<string, string>;
  href: string;
  at: string; // ISO
  read: boolean;
}

function iso(daysAgo: number, hh: number, mm: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

const pendingName = (i: number) => {
  const d = pendingDoctors[i];
  return d ? `${d.firstName} ${d.lastName}` : "";
};

const recordTitle = (id: string) => getRecordById(id)?.title ?? "";

const byRole: Record<UserRole, MockNotification[]> = {
  patient: [
    { id: "n-p0", type: "recordUrgent", params: { name: "Bekzod Rahimov", title: recordTitle("rec-15") }, href: "/patient/records#record-rec-15", at: iso(1, 17, 40), read: false },
    { id: "n-p5", type: "recordAttention", params: { name: "Bekzod Rahimov", title: recordTitle("rec-13") }, href: "/patient/records#record-rec-13", at: iso(12, 12, 10), read: true },
    { id: "n-p1", type: "appointmentReminder", params: { name: "Bekzod Rahimov", time: "16:30" }, href: "/patient/appointments/apt-1", at: iso(0, 8, 0), read: false },
    { id: "n-p2", type: "newMessage", params: { name: "Bekzod Rahimov" }, href: "/patient/chat/chat-1", at: iso(0, 10, 42), read: false },
    { id: "n-p3", type: "newRecord", params: { name: "Bekzod Rahimov" }, href: "/patient/records", at: iso(1, 17, 5), read: false },
    { id: "n-p4", type: "reviewRequest", params: { name: "Bekzod Rahimov" }, href: "/patient/review/apt-4", at: iso(3, 12, 0), read: true },
  ],
  doctor: [
    { id: "n-d1", type: "newBooking", params: { name: "Otabek Qodirov", time: "15:00" }, href: "/doctor/appointments/apt-10", at: iso(0, 7, 40), read: false },
    { id: "n-d2", type: "newMessage", params: { name: "Jasur Tursunov" }, href: "/doctor/chat/dchat-2", at: iso(0, 8, 12), read: true },
    { id: "n-d3", type: "recordUploaded", params: { name: "Jasur Tursunov" }, href: "/doctor/patients/u-patient-2", at: iso(1, 18, 30), read: true },
  ],
  admin: [
    { id: "n-a1", type: "newApplication", params: { name: pendingName(0) }, href: `/admin/applications/${pendingDoctors[0]?.id ?? ""}`, at: iso(0, 9, 10), read: false },
    { id: "n-a2", type: "reviewReported", params: { name: "Sardor M." }, href: "/admin/reviews", at: iso(0, 9, 45), read: false },
    { id: "n-a3", type: "newApplication", params: { name: pendingName(1) }, href: `/admin/applications/${pendingDoctors[1]?.id ?? ""}`, at: iso(1, 11, 20), read: false },
    { id: "n-a4", type: "userRegistered", params: { name: "Otabek Qodirov" }, href: "/admin/users", at: iso(1, 14, 0), read: false },
    { id: "n-a5", type: "newApplication", params: { name: pendingName(2) }, href: `/admin/applications/${pendingDoctors[2]?.id ?? ""}`, at: iso(2, 16, 30), read: false },
  ],
};

export function getNotifications(role: UserRole): MockNotification[] {
  return byRole[role];
}
