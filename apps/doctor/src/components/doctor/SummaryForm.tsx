"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Save } from "lucide-react";
import type { DoctorSummary, RecordSeverity } from "@projectx/types";
import { Button } from "@projectx/ui/Button";
import { Input, Textarea } from "@projectx/ui/Input";
import { SeverityPicker } from "@projectx/ui/records/SeverityPicker";

/** Doctor's post-visit note editor (diagnosis + recommendations + how urgent it is for the patient). UI only. */
export function SummaryForm({
  initial,
  onSaved,
  compact,
}: {
  initial?: DoctorSummary;
  onSaved?: (s: DoctorSummary) => void;
  compact?: boolean;
}) {
  const t = useTranslations("doctor.appointments");
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? "");
  const [rec, setRec] = useState(initial?.recommendations ?? "");
  const [severity, setSeverity] = useState<RecordSeverity>(initial?.severity ?? "normal");
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        onSaved?.({ diagnosis, recommendations: rec, severity, createdAt: new Date().toISOString().slice(0, 10) });
      }}
    >
      {!compact && <p className="text-sm text-muted">{t("summaryDesc")}</p>}
      <Input label={t("diagnosis")} placeholder={t("diagnosisPlaceholder")} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
      <Textarea label={t("recommendations")} placeholder={t("recommendationsPlaceholder")} value={rec} onChange={(e) => setRec(e.target.value)} rows={5} required />
      <SeverityPicker value={severity} onChange={setSeverity} />
      <div className="flex items-center justify-between gap-3">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> {t("summarySaved")}
          </span>
        ) : (
          <span />
        )}
        <Button type="submit" icon={<Save className="h-4 w-4" />}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
