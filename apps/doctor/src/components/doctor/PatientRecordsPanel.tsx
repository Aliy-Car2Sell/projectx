"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MedicalRecord, User } from "@projectx/types";
import { today } from "@projectx/utils/dates";
import { Modal } from "@projectx/ui/Modal";
import { RecordsView } from "@projectx/ui/records/RecordsView";
import { SummaryForm } from "./SummaryForm";

/** The patient's notebook as the doctor sees it (no private or unreviewed entries), with "add" and "write a summary". */
export function PatientRecordsPanel({ patient, records, doctorName, doctorId }: { patient: User; records: MedicalRecord[]; doctorName: string; doctorId: string }) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [written, setWritten] = useState<MedicalRecord[]>([]);
  return (
    <>
      <RecordsView
        patient={patient}
        records={[...written, ...records]}
        role="doctor"
        writer={{ role: "doctor", name: doctorName, doctorId }}
        onAddSummary={() => setOpen(true)}
        printHref={`/doctor/patients/${patient.id}/print`}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t("summaryTitle")} closeLabel={tc("close")} size="lg">
        <SummaryForm
          onSaved={(s) => {
            // Session only: the new summary drops into the notebook right away.
            setWritten((prev) => [
              {
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
              },
              ...prev,
            ]);
            setTimeout(() => setOpen(false), 900);
          }}
        />
      </Modal>
    </>
  );
}
