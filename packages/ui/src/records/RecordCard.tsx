"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";
import type { MedicalRecord } from "@projectx/types";
import { cn } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { recordIcon } from "./RecordEntry";
import { SeverityMark } from "./SeverityMark";

/**
 * A notebook entry reduced to one line (kind, title, date, severity dot) for the chat: the chip above
 * the composer (`onRemove`) and the card on a message (`href` opens the entry in the notebook).
 * `inverse` sits on the sender's blue bubble.
 */
export function RecordCard({
  record,
  href,
  onRemove,
  inverse,
  className,
}: {
  record: MedicalRecord;
  href?: string;
  onRemove?: () => void;
  inverse?: boolean;
  className?: string;
}) {
  const t = useTranslations("records");
  const tchat = useTranslations("chat.attachedRecord");
  const tc = useTranslations("common");
  const locale = useLocale();
  const Icon = recordIcon[record.type] ?? FileText;
  const body = (
    <>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", inverse ? "bg-white/20 text-white" : "bg-primary-soft text-primary-text")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-semibold", inverse ? "text-white" : "text-heading")}>{record.title}</span>
        <span className={cn("flex flex-wrap items-center gap-x-2 text-xs", inverse ? "text-white/80" : "text-muted")}>
          <span>
            {t(`types.${record.type}`)} · {fmtDate(locale, tc, record.date, "short")}
          </span>
          {record.severity && <SeverityMark severity={record.severity} className={cn("text-[11px]", inverse && "text-white")} />}
        </span>
      </span>
    </>
  );
  const base = cn("flex items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left", inverse ? "border-white/30 bg-white/10" : "border-line bg-surface", className);

  if (href) {
    return (
      <Link href={href} className={cn(base, inverse ? "hover:bg-white/20" : "hover:border-primary")} title={tchat("open")}>
        {body}
      </Link>
    );
  }
  return (
    <div className={base} role="group" aria-label={tchat("label")}>
      {body}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={tchat("remove")} title={tchat("remove")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-line hover:text-heading">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
