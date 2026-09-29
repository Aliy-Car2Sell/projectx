"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Appointment, User } from "@projectx/types";
import { cn } from "@projectx/utils";
import { fmtDate, today } from "@projectx/utils/dates";
import { statusBlock, statusDot } from "./calendar";

const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
/** Appointments spelled out per day on desktop; the rest is "+n". */
const SHOWN = 3;

/**
 * The month as a classic grid. Desktop cells list the day's first appointments, phones show a dot
 * per appointment. Picking a day opens its week.
 */
export function MonthGrid({
  weeks,
  month,
  appointments,
  patients,
  onPickDay,
}: {
  weeks: string[][];
  /** `YYYY-MM` being shown; days of the neighbouring months are dimmed. */
  month: string;
  appointments: Appointment[];
  patients: Record<string, User>;
  onPickDay: (date: string) => void;
}) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const locale = useLocale();
  const todayIso = today();
  const byDay = new Map<string, Appointment[]>();
  for (const a of [...appointments].sort((x, y) => x.time.localeCompare(y.time))) byDay.set(a.date, [...(byDay.get(a.date) ?? []), a]);

  return (
    <div className="overflow-hidden rounded-xl border border-line/60 bg-card shadow-card">
      <div className="grid grid-cols-7 border-b border-line">
        {weekdays.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold uppercase text-muted">
            {tc(`weekdaysShort.${d}`)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((date) => {
          const list = byDay.get(date) ?? [];
          const outside = date.slice(0, 7) !== month;
          const isToday = date === todayIso;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onPickDay(date)}
              aria-label={`${fmtDate(locale, tc, date, "weekday")}: ${t("cal.count", { count: list.length })}`}
              className={cn(
                "flex min-h-[64px] min-w-0 flex-col items-stretch gap-1 border-b border-r border-line/60 p-1 text-left transition-colors hover:bg-surface md:min-h-[116px] md:p-1.5 [&:nth-child(7n)]:border-r-0",
                outside && "bg-surface/60 text-muted",
                isToday && "bg-primary-soft/40",
              )}
            >
              <span className="flex items-center justify-between gap-1">
                <span className={cn("flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-sm font-semibold", isToday ? "bg-primary text-white" : outside ? "text-muted" : "text-heading")}>
                  {Number(date.slice(8, 10))}
                </span>
                {list.length > 0 && <span className="rounded-full bg-primary-soft px-1.5 text-[11px] font-bold tabular-nums text-primary-text max-md:hidden">{list.length}</span>}
              </span>

              {/* Phones: a dot per appointment */}
              <span className="flex flex-wrap items-center justify-center gap-0.5 md:hidden" aria-hidden="true">
                {list.slice(0, 4).map((a) => (
                  <span key={a.id} className={cn("h-1.5 w-1.5 rounded-full", statusDot[a.status])} />
                ))}
                {list.length > 4 && <span className="text-[10px] font-semibold leading-none text-muted">+{list.length - 4}</span>}
              </span>

              {/* Desktop: the first few, in short */}
              <span className="hidden flex-col gap-0.5 md:flex">
                {list.slice(0, SHOWN).map((a) => {
                  const p = patients[a.patientId];
                  return (
                    <span key={a.id} className={cn("truncate rounded border px-1 text-[11px] leading-[18px]", statusBlock[a.status])}>
                      <span className="font-bold tabular-nums">{a.time}</span> {p ? `${p.firstName} ${p.lastName[0]}.` : a.patientId}
                    </span>
                  );
                })}
                {list.length > SHOWN && <span className="px-1 text-[11px] font-medium text-muted">{t("moreCount", { count: list.length - SHOWN })}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
