"use client";

import { useTranslations } from "next-intl";
import type { RecordSeverity } from "@projectx/types";
import { cn } from "@projectx/utils";
import { FieldLabel } from "../ui/Input";
import { severityTone } from "./SeverityMark";
import { severities } from "./groupRecords";

/** The doctor's mandatory choice when writing into a notebook: three radios, each with a one-line hint. */
export function SeverityPicker({ value, onChange, className }: { value: RecordSeverity; onChange: (v: RecordSeverity) => void; className?: string }) {
  const t = useTranslations("records.severity");
  return (
    <div className={className}>
      <FieldLabel>{t("label")}</FieldLabel>
      <div className="mt-1.5 flex flex-col gap-2" role="radiogroup" aria-label={t("label")}>
        {severities.map((s) => {
          const active = value === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(s)}
              className={cn(
                "flex min-h-[44px] items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                active ? "border-primary bg-primary-soft" : "border-line hover:border-primary",
              )}
            >
              <span className={cn("mt-1.5 h-3 w-3 shrink-0 rounded-full", severityTone[s].dot)} aria-hidden="true" />
              <span className="min-w-0">
                <span className={cn("block text-sm font-semibold", severityTone[s].text)}>{t(s)}</span>
                <span className="block text-xs text-muted">{t(`hint.${s}`)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
