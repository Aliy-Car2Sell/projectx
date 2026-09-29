"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Save } from "lucide-react";
import type { DoctorSummary, RecordSeverity, SpecialtyKey, SummaryTemplateSection } from "@projectx/types";
import { currentDoctor } from "@projectx/mock/doctors";
import { getSummaryTemplates } from "@projectx/mock/templates";
import { today } from "@projectx/utils/dates";
import { Button } from "@projectx/ui/Button";
import { Input, Textarea } from "@projectx/ui/Input";
import { Select } from "@projectx/ui/Select";
import { SeverityPicker } from "@projectx/ui/records/SeverityPicker";
import { BLANK_TEMPLATE_ID, buildSummary, groupTemplates, useSummaryTemplates } from "@projectx/ui/summary/templates";

/**
 * Doctor's post-visit note editor. A template splits it into titled parts (one field each);
 * the "blank" one is the plain diagnosis + recommendations form. How urgent the note is for the
 * patient is chosen below. UI only.
 */
export function SummaryForm({
  initial,
  onSaved,
  compact,
  specialty = currentDoctor.specialty,
}: {
  initial?: DoctorSummary;
  onSaved?: (s: DoctorSummary) => void;
  compact?: boolean;
  specialty?: SpecialtyKey;
}) {
  const t = useTranslations("doctor.appointments");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const builtIn = useMemo(() => getSummaryTemplates(locale), [locale]);
  const { all, lastUsed, setLastUsed } = useSummaryTemplates(builtIn);
  const groups = groupTemplates(all, specialty);

  // Until the doctor picks one: the template the note was written with, else the one used last.
  const [picked, setPicked] = useState<string | null>(null);
  const wanted = picked ?? initial?.templateId ?? (initial ? BLANK_TEMPLATE_ID : lastUsed);
  const template = all.find((x) => x.id === wanted) ?? all.find((x) => x.id === BLANK_TEMPLATE_ID) ?? all[0];

  // Text is kept by part title, so switching templates keeps what the parts have in common
  // (and brings the rest back when switching again).
  const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries((initial?.sections ?? []).map((s) => [s.title, s.body])));
  const valueOf = (s: SummaryTemplateSection) => texts[s.title] ?? (initial && !initial.sections && s.role ? initial[s.role] : "");
  const [severity, setSeverity] = useState<RecordSeverity>(initial?.severity ?? "normal");
  const [saved, setSaved] = useState(false);

  const bodies = template.sections.map(valueOf);
  const hasRequired = template.sections.some((s) => s.role === "diagnosis");
  const empty = bodies.every((b) => !b.trim());

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (empty) return;
        setSaved(true);
        setLastUsed(template.id);
        onSaved?.(buildSummary(template, bodies, { severity, createdAt: today() }));
      }}
    >
      {!compact && <p className="text-sm text-muted">{t("summaryDesc")}</p>}
      <Select
        label={t("template.label")}
        value={template.id}
        onChange={(e) => {
          setPicked(e.target.value);
          setSaved(false);
        }}
        groups={[
          { label: t("template.mine"), options: groups.mine.map((x) => ({ value: x.id, label: x.name })) },
          { label: ts(specialty), options: groups.own.map((x) => ({ value: x.id, label: x.name })) },
          { label: t("template.others"), options: groups.others.map((x) => ({ value: x.id, label: x.name })) },
        ]}
      />
      {template.sections.map((s, i) => {
        const props = {
          label: s.title,
          placeholder: s.placeholder,
          value: bodies[i],
          required: s.role === "diagnosis",
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setTexts((prev) => ({ ...prev, [s.title]: e.target.value }));
            setSaved(false);
          },
        };
        // The diagnosis becomes the entry's title: one line.
        return s.role === "diagnosis" ? <Input key={s.title} {...props} /> : <Textarea key={s.title} {...props} rows={s.role === "recommendations" ? 4 : 2} required={template.id === BLANK_TEMPLATE_ID} />;
      })}
      {!hasRequired && empty && <p className="text-sm text-muted">{t("template.fillOne")}</p>}
      <SeverityPicker value={severity} onChange={setSeverity} />
      <div className="flex items-center justify-between gap-3">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
            <Check className="h-4 w-4" /> {t("summarySaved")}
          </span>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={empty} icon={<Save className="h-4 w-4" />}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
