/**
 * Domain types. These mirror the future Prisma models
 * (User, DoctorProfile, Slot, Appointment, MedicalRecord, ChatMessage, Review).
 */

export type UserRole = "patient" | "doctor" | "admin";
export type UserStatus = "active" | "blocked";

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string; // ISO date
  city?: CityKey;
  birthDate?: string; // YYYY-MM-DD
  bloodType?: string; // e.g. "A(II) Rh+"
}

export type SpecialtyKey =
  | "cardiologist"
  | "dentist"
  | "pediatrician"
  | "neurologist"
  | "dermatologist"
  | "therapist"
  | "ophthalmologist"
  | "gynecologist"
  | "orthopedist"
  | "ent"
  | "endocrinologist"
  | "urologist";

export type CategoryKey = "highest" | "first" | "second" | "none";
export type CityKey = "tashkent" | "samarkand" | "bukhara" | "andijan" | "fergana";
export type DoctorStatus = "pending" | "approved" | "rejected" | "blocked";

export interface DoctorDocument {
  id: string;
  type: "diploma" | "certificate" | "license";
  fileName: string;
  fileType: "pdf" | "image";
  uploadedAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  specialty: SpecialtyKey;
  category: CategoryKey;
  experienceYears: number;
  clinicName: string;
  address: string;
  city: CityKey;
  lat: number;
  lng: number;
  phone: string;
  price?: number; // UZS, optional
  about: string;
  rating: number; // 0..5
  reviewCount: number;
  status: DoctorStatus;
  documents: DoctorDocument[];
  slotDurationMin: number;
  distanceKm?: number; // computed for the current user (mock)
  appliedAt?: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  isBooked: boolean;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

/** One titled part of a structured summary ("Shikoyatlar", "Tashxis"…), as written by the doctor. */
export interface SummarySection {
  title: string;
  body: string;
}

export interface SummaryTemplateSection {
  title: string;
  placeholder: string;
  /** The part that becomes the record's title (diagnosis) or its advice; at most one of each per template. */
  role?: "diagnosis" | "recommendations";
}

/** A form layout for the doctor's summary. "general" templates (the blank one) fit every specialty. */
export interface SummaryTemplate {
  id: string;
  specialty: SpecialtyKey | "general";
  name: string;
  sections: SummaryTemplateSection[];
  /** Made by the doctor ("my templates"), kept in the browser. */
  custom?: boolean;
}

export interface DoctorSummary {
  diagnosis: string;
  recommendations: string;
  /** The summary as the template laid it out; empty parts are left out. */
  sections?: SummarySection[];
  templateId?: string;
  createdAt: string;
  /** How urgently the patient should act on this note (chosen by the doctor). */
  severity?: RecordSeverity;
}

export type PaymentStatus = "paid" | "unpaid" | "onsite";
export type PaymentMethod = "payme" | "click";

/**
 * How the visit is paid for; only appointments with a doctor who set a price have one.
 * "unpaid" = online payment chosen or expected but not made yet; "onsite" = pays at the clinic.
 */
export interface AppointmentPayment {
  status: PaymentStatus;
  amount: number; // UZS
  method?: PaymentMethod;
  paidAt?: string; // ISO datetime
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMin: number;
  status: AppointmentStatus;
  reason?: string;
  summary?: DoctorSummary;
  reviewId?: string;
  payment?: AppointmentPayment;
}

export type RecordType =
  | "analysis"
  | "imaging"
  | "history"
  | "allergy"
  | "medication"
  | "summary"
  | "other";

/** One measured value of a lab result, shown as a row: "Gemoglobin 135 g/L · norma 120–160". */
export interface RecordValue {
  name: string;
  value: string;
  unit?: string;
  norm?: string;
}

/** Set by the doctor only: how urgently the patient should act on the entry. Patient entries have none. */
export type RecordSeverity = "normal" | "attention" | "urgent";

/**
 * Doctor entries are approved on creation; patient uploads wait for an admin
 * ("pending"), who approves or rejects them with a reason. A "deleted" entry stays
 * in the data for the audit trail: gone from the notebook, still visible to admins.
 */
export type RecordStatus = "approved" | "pending" | "rejected" | "deleted";

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: RecordType;
  title: string;
  description?: string;
  fileName?: string;
  fileType?: "pdf" | "image";
  /** Structured lab values (analysis records). */
  values?: RecordValue[];
  /** A summary written from a template: shown as titled parts; `description` holds the same text plainly. */
  sections?: SummarySection[];
  /** The template `sections` came from, so editing reopens the same form. */
  templateId?: string;
  /** "Only I can see this": hidden from doctors and from the "for the doctor" printout. Admins still see it for review. */
  private?: boolean;
  date: string; // YYYY-MM-DD
  isNew?: boolean;
  authorRole: UserRole;
  authorName?: string;
  /** DoctorProfile id when a doctor wrote the entry ("ask the doctor" opens that chat). */
  authorDoctorId?: string;
  severity?: RecordSeverity;
  status: RecordStatus;
  /** Why an admin rejected the entry (status "rejected"). */
  rejectReason?: string;
  /** ISO datetime the entry was added; shown in the admin review queue. */
  submittedAt?: string;
  /** Regular medication only: when to take it (dashboard "today's medicines", reminders, adherence). */
  schedule?: MedicationSchedule;
}

export type RecordAuditAction = "created" | "updated" | "approved" | "rejected" | "deleted" | "severityChanged";

/** One changed field; values are stored as plain text ("" = was empty / became empty). */
export interface RecordAuditChange {
  field: string;
  from: string;
  to: string;
}

/** One line of a record's history: who did what, and when. */
export interface RecordAuditEntry {
  id: string;
  recordId: string;
  at: string; // ISO datetime
  /** User id, or the DoctorProfile id when a doctor acted. */
  actorId: string;
  actorRole: UserRole;
  actorName: string;
  action: RecordAuditAction;
  /** "updated": the edited fields; "severityChanged": the severity; "rejected": the reason. */
  changes?: RecordAuditChange[];
}

/** When a regular medicine is taken: `times` are "HH:mm", one per dose. */
export interface MedicationSchedule {
  timesPerDay: number;
  times: string[];
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, inclusive; none = ongoing
}

/**
 * A regular medicine is a cover line of the record (`type: "medication"`) that has a schedule.
 * It is never hidden from doctors: "only me" does not apply to medication.
 */
export type RegularMedication = MedicalRecord & { type: "medication"; schedule: MedicationSchedule };

/** One scheduled dose; `takenAt` (ISO) is set once the patient ticks "I took it". */
export interface MedicationLog {
  medicationId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, one of the schedule's times
  takenAt?: string;
}

export interface Chat {
  id: string;
  participantId: string; // the other party
  participantName: string;
  participantAvatar?: string;
  participantRole: UserRole;
  participantSubtitle?: string; // e.g. specialty or "Bemor"
  lastMessage: string;
  lastMessageAt: string; // ISO
  unreadCount: number;
}

export interface ChatAttachment {
  type: "image" | "file";
  name: string;
  url?: string;
  sizeKb?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  attachment?: ChatAttachment;
  /** The medical record this message is about ("ask the doctor" from the notebook). */
  attachedRecordId?: string;
  sentAt: string; // ISO
}

export interface Review {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number; // 1..5
  text: string;
  createdAt: string; // ISO
  isHidden: boolean;
  reportReason?: string;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ScheduleDay {
  day: Weekday;
  enabled: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
  breakStart?: string;
  breakEnd?: string;
}

export interface DoctorSchedule {
  doctorId: string;
  slotDurationMin: number;
  days: ScheduleDay[];
}

export interface ActivityItem {
  id: string;
  type: "user_registered" | "doctor_applied" | "appointment_created" | "review_posted" | "review_reported";
  text: string;
  at: string; // ISO
}
