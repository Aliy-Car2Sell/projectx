"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, History } from "lucide-react";
import type { RecordAuditChange, RecordAuditEntry } from "@projectx/types";
import { cn, toIsoDate } from "@projectx/utils";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { severities } from "./groupRecords";

const knownFields = ["type", "title", "description", "date", "fileName", "private", "schedule", "severity", "sections"];
const recordTypes = ["analysis", "imaging", "history", "allergy", "medication", "summary", "other"];
const clip = (s: string) => (s.length > 90 ? `${s.slice(0, 90).trimEnd()}…` : s);

/** Sentences for the audit trail: "Doktor Rahimov holatni 'Me'yorda' dan 'E'tibor bering' ga o'zgartirdi". */
function useAuditText() {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const locale = useLocale();

  const value = (c: RecordAuditChange, v: string): string => {
    if (!v) return "";
    if (c.field === "severity") return (severities as string[]).includes(v) ? t(`severity.${v}`) : v;
    if (c.field === "type") return recordTypes.includes(v) ? t(`types.${v}`) : v;
    if (c.field === "private") return tc(v === "yes" ? "yes" : "no");
    if (c.field === "date") return /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(locale, tc, v, "medium") : v;
    return clip(v);
  };
  const field = (c: RecordAuditChange) => (knownFields.includes(c.field) ? t(`audit.fields.${c.field}`) : c.field);
  const change = (c: RecordAuditChange) => {
    const from = value(c, c.from);
    const to = value(c, c.to);
    if (!from) return t("audit.changeSet", { field: field(c), to });
    if (!to) return t("audit.changeCleared", { field: field(c), from });
    return t("audit.change", { field: field(c), from, to });
  };

  return (e: RecordAuditEntry): { text: string; details: string[] } => {
    const actor = t(`audit.actor.${e.actorRole}`, { name: e.actorName });
    const first = e.changes?.[0];
    switch (e.action) {
      case "severityChanged":
        return first
          ? { text: t("audit.action.severityChanged", { actor, from: value(first, first.from) || t("audit.noSeverity"), to: value(first, first.to) || t("audit.noSeverity") }), details: [] }
          : { text: t("audit.action.updated", { actor }), details: [] };
      case "rejected":
        return { text: t("audit.action.rejected", { actor }), details: first?.to ? [t("audit.reason", { reason: first.to })] : [] };
      case "updated":
        return { text: t("audit.action.updated", { actor }), details: (e.changes ?? []).map(change) };
      default:
        return { text: t(`audit.action.${e.action}`, { actor }), details: [] };
    }
  };
}

/**
 * A record's history. Collapsed to a small "History (3)" link under the opened entry;
 * `variant="print"` lists it in small type (full printout only), `variant="open"` always shows it (admin).
 */
export function RecordHistory({ entries, variant = "toggle", className }: { entries: RecordAuditEntry[]; variant?: "toggle" | "open" | "print"; className?: string }) {
  const t = useTranslations("records.audit");
  const tc = useTranslations("common");
  const locale = useLocale();
  const describe = useAuditText();
  const [open, setOpen] = useState(false);
  if (entries.length === 0) return null;
  const print = variant === "print";
  const shown = variant !== "toggle" || open;

  const list = (
    <ol className={cn("flex flex-col", print ? "gap-0.5" : "mt-2 gap-2 border-l-2 border-line pl-3")}>
      {entries.map((e) => {
        const { text, details } = describe(e);
        return (
          <li key={e.id} className={cn("leading-snug", print ? "text-[11px] text-muted" : "text-sm")}>
            <span className={cn("tabular-nums text-muted", !print && "block text-xs")}>
              {/* The day as the reader's clock has it, like the time next to it (the ISO string is UTC). */}
              {fmtDate(locale, tc, toIsoDate(new Date(e.at)), "medium")} · {fmtTime(e.at)}
              {print && " — "}
            </span>
            <span className={print ? undefined : "text-heading"}>{text}</span>
            {details.map((d) => (
              <span key={d} className={cn("text-muted", print ? "before:content-['._']" : "block break-words text-xs")}>
                {d}
              </span>
            ))}
          </li>
        );
      })}
    </ol>
  );

  if (print) {
    return (
      <div className={cn("record-history mt-2 border-t border-dotted border-line pt-1.5", className)}>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("title", { count: entries.length })}</div>
        {list}
      </div>
    );
  }
  if (variant === "open") return <div className={className}>{list}</div>;

  return (
    <div className={cn("record-noprint mt-2", className)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-muted hover:text-primary-text">
        <History className="h-3.5 w-3.5" aria-hidden="true" />
        {t("title", { count: entries.length })}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {shown && list}
    </div>
  );
}
