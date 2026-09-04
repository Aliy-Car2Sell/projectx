"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ClipboardList, Pencil, Stethoscope } from "lucide-react";
import type { Appointment, DoctorSummary } from "@/types";
import { fmtDate } from "@/lib/dates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SummaryForm } from "./SummaryForm";

/** Shows the saved note or the note editor for a doctor's appointment. */
export function AppointmentSummaryPanel({ appointment }: { appointment: Appointment }) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [summary, setSummary] = useState<DoctorSummary | undefined>(appointment.summary);
  const [editing, setEditing] = useState(false);
  const canWrite = appointment.status === "completed" || appointment.status === "scheduled";

  if (summary && !editing) {
    return (
      <Card className="border-accent/40">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-white">
              <Stethoscope className="h-4 w-4" />
            </span>
            {fmtDate(locale, tc, summary.createdAt)}
          </div>
          <Button variant="ghost" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
            {t("editSummary")}
          </Button>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t("diagnosis")}</div>
        <p className="font-semibold text-heading mt-0.5">{summary.diagnosis}</p>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted mt-3">{t("recommendations")}</div>
        <p className="text-heading mt-0.5 leading-relaxed whitespace-pre-line">{summary.recommendations}</p>
      </Card>
    );
  }

  if (!canWrite) {
    return <EmptyState compact icon={<ClipboardList className="h-7 w-7" />} title={t("noSummaryYet")} description={t("noSummaryYetDesc")} />;
  }

  return (
    <Card>
      <SummaryForm
        initial={summary}
        onSaved={(s) => {
          setSummary(s);
          setTimeout(() => setEditing(false), 900);
        }}
      />
    </Card>
  );
}
