"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MedicalRecord } from "@projectx/types";
import { Modal } from "@projectx/ui/Modal";
import { RecordsView } from "@projectx/ui/records/RecordsView";
import { SummaryForm } from "./SummaryForm";

/** Read-only patient records for doctors, with an "add note" modal. */
export function PatientRecordsPanel({ records }: { records: MedicalRecord[] }) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  return (
    <>
      <RecordsView records={records} mode="doctor" onAddSummary={() => setOpen(true)} />
      <Modal open={open} onClose={() => setOpen(false)} title={t("summaryTitle")} closeLabel={tc("close")} size="lg">
        <SummaryForm onSaved={() => setTimeout(() => setOpen(false), 900)} />
      </Modal>
    </>
  );
}
