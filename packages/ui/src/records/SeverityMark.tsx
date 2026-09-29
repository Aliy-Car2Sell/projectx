import { useTranslations } from "next-intl";
import type { RecordSeverity } from "@projectx/types";
import { cn } from "@projectx/utils";

/** The dot is the status 500 inside a soft halo of its 50; the label is the AA text colour (the 700). */
export const severityTone: Record<RecordSeverity, { dot: string; text: string }> = {
  normal: { dot: "bg-success-500 ring-[3px] ring-success-500/20", text: "text-success-700" },
  attention: { dot: "bg-warning-500 ring-[3px] ring-warning-500/25", text: "text-warning-700" },
  urgent: { dot: "bg-danger-500 ring-[3px] ring-danger-500/20", text: "text-danger-700" },
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
    <span className={cn("inline-flex items-start gap-2 text-xs font-semibold leading-tight", tone.text, className)} title={label} aria-label={compact ? label : undefined} role={compact ? "img" : undefined}>
      <span className={cn("ml-[3px] mt-[3px] h-2 w-2 shrink-0 rounded-pill", tone.dot)} aria-hidden="true" />
      {!compact && <span>{label}</span>}
    </span>
  );
}
