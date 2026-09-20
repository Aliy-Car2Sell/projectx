"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MedicalRecord, User } from "@projectx/types";
import { today } from "@projectx/utils/dates";
import { Modal } from "@projectx/ui/Modal";
import { RecordsView } from "@projectx/ui/records/RecordsView";
import { SummaryForm } from "./SummaryForm";

/** The patient's notebook as the doctor sees it (no private entries), with a "write a summary" modal. */
export function PatientRecordsPanel({ patient, records, doctorName }: { patient: User; records: MedicalRecord[]; doctorName: string }) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [written, setWritten] = useState<MedicalRecord[]>([]);
  return (
    <>
      <RecordsView patient={patient} records={[...written, ...records]} role="doctor" onAddSummary={() => setOpen(true)} />
      <Modal open={open} onClose={() => setOpen(false)} title={t("summaryTitle")} closeLabel={tc("close")} size="lg">
        <SummaryForm
          onSaved={(s) => {
            // Session only: the new summary drops into the notebook right away.
            setWritten((prev) => [
              { id: `rec-local-${Date.now()}`, patientId: patient.id, type: "summary", title: s.diagnosis, description: s.recommendations, date: today(), isNew: true, authorRole: "doctor", authorName: doctorName },
              ...prev,
            ]);
            setTimeout(() => setOpen(false), 900);
          }}
        />
      </Modal>
    </>
  );
}
