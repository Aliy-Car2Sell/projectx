import { useTranslations } from "next-intl";
import type { RecordSeverity } from "@projectx/types";
import { cn } from "@projectx/utils";

/** Fill for the dot and an AA text colour for the label (same pairs the Badge uses). */
export const severityTone: Record<RecordSeverity, { dot: string; text: string }> = {
  normal: { dot: "bg-success", text: "text-green-700" },
  attention: { dot: "bg-warning", text: "text-amber-700" },
  urgent: { dot: "bg-danger", text: "text-red-700" },
};

/**
 * Coloured dot + short label of a doctor's severity mark. The label is always rendered so a
 * black-and-white printout still says "Urgent"; `compact` keeps just the dot with the label as tooltip.
 */
export function SeverityMark({ severity, compact, className }: { severity: RecordSeverity; compact?: boolean; className?: string }) {
  const t = useTranslations("records.severity");
  const tone = severityTone[severity];
  const label = t(severity);
  return (
    <span className={cn("inline-flex items-start gap-1.5 text-xs font-semibold leading-tight", tone.text, className)} title={label} aria-label={compact ? label : undefined} role={compact ? "img" : undefined}>
      <span className={cn("mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full", tone.dot)} aria-hidden="true" />
      {!compact && <span>{label}</span>}
    </span>
  );
}
