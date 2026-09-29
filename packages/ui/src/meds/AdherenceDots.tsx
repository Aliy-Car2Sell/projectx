"use client";

import { useLocale, useTranslations } from "next-intl";
import type { MedicationLog, RegularMedication } from "@projectx/types";
import { cn } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { adherence } from "./medications";

/** "6/7" and one dot per day (oldest first): green = every dose taken, grey = missed, hollow = not prescribed yet. */
export function AdherenceDots({ medication, logs, dates }: { medication: RegularMedication; logs: MedicationLog[]; dates: string[] }) {
  const t = useTranslations("meds.adherence");
  const tc = useTranslations("common");
  const locale = useLocale();
  const a = adherence(medication, logs, dates);
  if (a.total === 0) return null;
  return (
    <span className="record-noprint inline-flex items-center gap-1.5 whitespace-nowrap align-middle" role="img" aria-label={t("label", { taken: a.taken, total: a.total })} title={t("label", { taken: a.taken, total: a.total })}>
      <span className={cn("text-sm font-bold tabular-nums", a.taken === a.total ? "text-green-700" : a.taken / a.total < 0.6 ? "text-red-700" : "text-amber-700")}>
        {a.taken}/{a.total}
      </span>
      <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
        {a.days.map((d) => (
          <span
            key={d.date}
            title={`${fmtDate(locale, tc, d.date, "short")}: ${t(d.taken === null ? "none" : d.taken ? "taken" : "missed")}`}
            className={cn("h-2 w-2 rounded-full", d.taken === null ? "border border-line" : d.taken ? "bg-success" : "bg-muted/40")}
          />
        ))}
      </span>
    </span>
  );
}
