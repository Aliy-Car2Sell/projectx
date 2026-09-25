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

export interface DoctorSummary {
  diagnosis: string;
  recommendations: string;
  createdAt: string;
  /** How urgently the patient should act on this note (chosen by the doctor). */
  severity?: RecordSeverity;
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
 * ("pending"), who approves or rejects them with a reason.
 */
export type RecordStatus = "approved" | "pending" | "rejected";

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
