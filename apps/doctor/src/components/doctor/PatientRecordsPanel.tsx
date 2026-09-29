"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MedicalRecord, MedicationLog, RecordAuditEntry, User } from "@projectx/types";
import { today } from "@projectx/utils/dates";
import { Modal } from "@projectx/ui/Modal";
import { RecordsView } from "@projectx/ui/records/RecordsView";
import { useRecordAudit } from "@projectx/ui/records/audit";
import { useLocalRecords } from "@projectx/ui/records/useLocalRecords";
import { SummaryForm } from "./SummaryForm";

/** The patient's notebook as the doctor sees it (no private or unreviewed entries), with "add" and "write a summary". */
export function PatientRecordsPanel({
  patient,
  records,
  medicationLogs,
  audit,
  doctorName,
  doctorId,
}: {
  patient: User;
  records: MedicalRecord[];
  medicationLogs: MedicationLog[];
  audit: RecordAuditEntry[];
  doctorName: string;
  doctorId: string;
}) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const { save } = useLocalRecords(patient.id, records);
  const { log } = useRecordAudit(audit);
  return (
    <>
      <RecordsView
        patient={patient}
        records={records}
        role="doctor"
        writer={{ role: "doctor", name: doctorName, doctorId }}
        onAddSummary={() => setOpen(true)}
        medicationLogs={medicationLogs}
        audit={audit}
        printHref={`/doctor/patients/${patient.id}/print`}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t("summaryTitle")} closeLabel={tc("close")} size="lg">
        <SummaryForm
          onSaved={(s) => {
            // Kept in this browser only: the new summary drops into the notebook right away.
            const record: MedicalRecord = {
              id: `rec-local-${Date.now()}`,
              patientId: patient.id,
              type: "summary",
              title: s.diagnosis,
              description: s.recommendations,
              date: today(),
              isNew: true,
              authorRole: "doctor",
              authorName: doctorName,
              authorDoctorId: doctorId,
              severity: s.severity ?? "normal",
              status: "approved",
            };
            save(record);
            log(record.id, { id: doctorId, role: "doctor", name: doctorName }, "created");
            setTimeout(() => setOpen(false), 900);
          }}
        />
      </Modal>
    </>
  );
}
