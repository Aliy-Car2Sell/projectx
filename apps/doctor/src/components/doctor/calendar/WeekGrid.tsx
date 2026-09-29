"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Appointment, DoctorSchedule, User } from "@projectx/types";
import { cn, weekdayKey } from "@projectx/utils";
import { fmtDate, today } from "@projectx/utils/dates";
import { useNow } from "@projectx/ui/session/useNow";
import { gridHours, minutesOf, placeDay, scheduleDay, slotKind, statusBlock, timeOf } from "./calendar";

/** Height of one slot row in px. */
const ROW = 44;
const hatch = "bg-[repeating-linear-gradient(135deg,transparent_0,transparent_5px,var(--color-line)_5px,var(--color-line)_6px)]";

/**
 * One week as a time grid: a column per day (Mon–Sun), a row per slot of the doctor's schedule.
 * Free slots are tinted, the break is hatched, hours outside the working day are blank.
 * Phones show three days at a time and scroll sideways (starting at `focus`, the opened day).
 */
export function WeekGrid({
  days,
  focus,
  appointments,
  patients,
  schedule,
  onOpen,
}: {
  days: string[];
  focus: string;
  appointments: Appointment[];
  patients: Record<string, User>;
  schedule: DoctorSchedule;
  onOpen: (a: Appointment) => void;
}) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const tstatus = useTranslations("status.appointment");
  const locale = useLocale();
  const now = useNow();
  const scroller = useRef<HTMLDivElement>(null);
  const inWeek = appointments.filter((a) => days.includes(a.date));
  const { start, end, step } = gridHours(schedule, inWeek);
  const rows = Array.from({ length: (end - start) / step }, (_, i) => start + i * step);
  const height = rows.length * ROW;
  const y = (minute: number) => ((minute - start) / step) * ROW;
  const todayIso = now?.date ?? today();
  const nowMin = now ? minutesOf(now.time) : null;

  // Phones: bring the opened day to the left edge, right after the time column.
  useEffect(() => {
    const el = scroller.current;
    const col = el?.querySelector<HTMLElement>(`[data-date="${focus}"]`);
    const gutter = el?.querySelector<HTMLElement>("[data-gutter]");
    if (el && col && gutter) el.scrollLeft = col.offsetLeft - gutter.offsetWidth;
  }, [focus, days]);

  return (
    <div ref={scroller} className="overflow-x-auto overscroll-x-contain rounded-xl border border-line/60 bg-card shadow-card [container-type:inline-size] max-md:snap-x max-md:scroll-pl-11">
      <div className="flex w-max min-w-full md:w-full">
        {/* Time column: stays put while the days scroll sideways */}
        <div data-gutter className="sticky left-0 z-20 w-11 shrink-0 border-r border-line bg-card md:w-14">
          <div className="h-14 border-b border-line" />
          <div className="relative" style={{ height }}>
            {rows
              .filter((m) => m % 60 === 0)
              .map((m) => (
                <span key={m} className="absolute right-1.5 -translate-y-1/2 text-[11px] tabular-nums text-muted first:translate-y-0.5" style={{ top: y(m) }}>
                  {timeOf(m)}
                </span>
              ))}
          </div>
        </div>

        {days.map((date) => {
          const isToday = date === todayIso;
          const day = scheduleDay(schedule, date);
          const placed = placeDay(inWeek.filter((a) => a.date === date));
          const showNow = isToday && nowMin !== null && nowMin >= start && nowMin <= end;
          return (
            <div
              key={date}
              data-date={date}
              role="group"
              aria-label={fmtDate(locale, tc, date, "weekday")}
              className={cn("w-[calc((100cqw-2.75rem)/3)] shrink-0 border-r border-line last:border-r-0 max-md:snap-start md:w-auto md:min-w-0 md:flex-1", isToday && "bg-primary-soft/40")}
            >
              <div className={cn("flex h-14 flex-col items-center justify-center border-b border-line", isToday ? "text-primary-text" : "text-heading")}>
                <span className="text-xs uppercase text-muted">{tc(`weekdaysShort.${weekdayKey(date)}`)}</span>
                <span className={cn("flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-bold", isToday && "bg-primary text-white")}>{Number(date.slice(8, 10))}</span>
              </div>

              <div className="relative" style={{ height }}>
                {rows.map((m) => {
                  const kind = slotKind(day, m);
                  return (
                    <div
                      key={m}
                      title={kind === "break" ? t("cal.break") : kind === "free" ? `${timeOf(m)} · ${t("cal.free")}` : undefined}
                      className={cn("absolute inset-x-0 border-b border-line/60", m % 60 !== 0 && "border-dashed", kind === "free" && "bg-success-soft/50", kind === "break" && hatch)}
                      style={{ top: y(m), height: ROW }}
                    />
                  );
                })}
                {!day?.enabled && placed.length === 0 && <span className="absolute inset-x-0 top-3 text-center text-xs text-muted">{t("cal.dayOff")}</span>}

                {placed.map(({ appointment: a, start: s, end: e, lane, lanes }) => {
                  const p = patients[a.patientId];
                  const name = p ? `${p.firstName} ${p.lastName[0]}.` : a.patientId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onOpen(a)}
                      aria-label={`${a.time}, ${p ? `${p.firstName} ${p.lastName}` : a.patientId}, ${tstatus(a.status)}`}
                      className={cn("absolute z-10 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-xs leading-tight shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary", statusBlock[a.status])}
                      style={{ top: y(s) + 1, height: Math.max(y(e) - y(s) - 2, 22), left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                    >
                      <span className="block font-bold tabular-nums">{a.time}</span>
                      <span className="block truncate">{name}</span>
                    </button>
                  );
                })}

                {showNow && (
                  <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: y(nowMin) }} role="img" aria-label={t("cal.now", { time: now?.time ?? "" })}>
                    <span className="-ml-1 h-2 w-2 -translate-y-1/2 rounded-full bg-danger" />
                    <span className="h-0.5 flex-1 -translate-y-1/2 bg-danger" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
