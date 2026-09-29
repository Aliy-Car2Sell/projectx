import type { MedicalRecord, RecordAuditChange, RecordAuditEntry } from "@projectx/types";
import { records } from "./records";
import { currentAdmin, fullName, getUserById } from "./users";

const admin = { actorId: currentAdmin.id, actorRole: "admin" as const, actorName: fullName(currentAdmin) };

function authorOf(r: MedicalRecord) {
  if (r.authorRole === "doctor") return { actorId: r.authorDoctorId ?? "doc-unknown", actorRole: "doctor" as const, actorName: r.authorName ?? "" };
  const u = getUserById(r.patientId);
  return { actorId: r.patientId, actorRole: "patient" as const, actorName: u ? fullName(u) : "" };
}

/** ISO datetime `minutes` after `iso`. */
function after(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

/** What an entry said before it was edited (one "updated" line each); the new value is the record's own. */
const before: Record<string, { field: "title" | "description"; from: string }> = {
  "rec-2": { field: "description", from: "Glyukoza 5.4, xolesterin 5.9" },
  "rec-11": { field: "title", from: "Amlodipin 2.5 mg" },
  "rec-14": { field: "description", from: "Allergik dermatit. Loratadin 10 mg, 7 kun." },
};

function editsOf(r: MedicalRecord): RecordAuditChange[] | undefined {
  const b = before[r.id];
  return b && [{ field: b.field, from: b.from, to: r[b.field] ?? "" }];
}

/**
 * History of one record, oldest first. Derived from the record itself so every mock entry has
 * one to three lines: created, then what its state implies (review, severity, edit, deletion).
 */
function historyOf(r: MedicalRecord): RecordAuditEntry[] {
  const author = authorOf(r);
  const createdAt = r.submittedAt ?? new Date(`${r.date}T10:00:00`).toISOString();
  const out: Omit<RecordAuditEntry, "id" | "recordId">[] = [{ at: createdAt, ...author, action: "created" }];

  const edited = editsOf(r);
  if (edited) out.push({ at: after(createdAt, 25), ...author, action: "updated", changes: edited });
  if (r.authorRole === "doctor" && (r.severity === "attention" || r.severity === "urgent")) {
    out.push({ at: after(createdAt, 40), ...author, action: "severityChanged", changes: [{ field: "severity", from: "normal", to: r.severity }] });
  }
  if (r.authorRole === "patient" && r.submittedAt) {
    if (r.status === "approved") out.push({ at: after(createdAt, 180), ...admin, action: "approved" });
    if (r.status === "rejected") out.push({ at: after(createdAt, 180), ...admin, action: "rejected", changes: [{ field: "rejectReason", from: "", to: r.rejectReason ?? "" }] });
  }
  if (r.status === "deleted") out.push({ at: after(createdAt, 60 * 26), ...author, action: "deleted" });

  return out.map((e, i) => ({ ...e, id: `audit-${r.id}-${i + 1}`, recordId: r.id }));
}

export function getRecordAudit(recordId: string): RecordAuditEntry[] {
  const r = records.find((x) => x.id === recordId);
  return r ? historyOf(r) : [];
}

export function getPatientAudit(patientId: string): RecordAuditEntry[] {
  return records.filter((r) => r.patientId === patientId).flatMap(historyOf);
}

/** Every record's history (admin review queue). */
export function getAllAudit(): RecordAuditEntry[] {
  return records.flatMap(historyOf);
}
