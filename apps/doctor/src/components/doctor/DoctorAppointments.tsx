"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, ClipboardList, List } from "lucide-react";
import type { Appointment, AppointmentStatus, DoctorSchedule, User } from "@projectx/types";
import { cn, isoDateFromNow, isToday } from "@projectx/utils";
import { fmtDate, fmtMonthYear, today } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Chip } from "@projectx/ui/Chip";
import { EmptyState, ErrorState } from "@projectx/ui/EmptyState";
import { RetryButton } from "@projectx/ui/RetryButton";
import { ListSkeleton } from "@projectx/ui/Skeleton";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import type { DemoState } from "@projectx/ui/demo/state";
import { AppointmentSheet } from "./calendar/AppointmentSheet";
import { MonthGrid } from "./calendar/MonthGrid";
import { WeekGrid } from "./calendar/WeekGrid";
import { addDays, addMonths, monthWeeks, weekOf, type CalendarView } from "./calendar/calendar";
import { useCalendarQuery } from "./calendar/useCalendarQuery";

const views: { key: CalendarView; icon: typeof List }[] = [
  { key: "list", icon: List },
  { key: "week", icon: CalendarRange },
  { key: "month", icon: CalendarDays },
];

/**
 * The doctor's appointments as a list, a week grid or a month grid (`?view=list|week|month&date=`).
 * The status chips narrow all three.
 */
export function DoctorAppointments({
  appointments,
  patients,
  schedule,
  state = "normal",
}: {
  appointments: Appointment[];
  patients: Record<string, User>;
  schedule: DoctorSchedule;
  state?: DemoState;
}) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const tst = useTranslations("states");
  const tstatus = useTranslations("status.appointment");
  const locale = useLocale();
  const { view, date, go } = useCalendarQuery();
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [opened, setOpened] = useState<Appointment | null>(null);

  const filtered = useMemo(
    () =>
      (state === "empty" ? [] : appointments)
        .filter((a) => status === "all" || a.status === status)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [appointments, status, state],
  );

  const days = useMemo(() => weekOf(date), [date]);
  const weeks = useMemo(() => monthWeeks(date), [date]);
  const step = (by: -1 | 1) => go({ date: view === "month" ? addMonths(date, by) : addDays(date, by * 7) });
  const onToday = view === "month" ? date.slice(0, 7) === today().slice(0, 7) : days.includes(today());

  // Group list view by day
  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of filtered) map.set(a.date, [...(map.get(a.date) ?? []), a]);
    return [...map.entries()];
  }, [filtered]);

  const dayTitle = (date: string) => {
    if (isToday(date)) return `${tc("today")} · ${fmtDate(locale, tc, date, "dayMonth")}`;
    if (date === isoDateFromNow(1)) return `${tc("tomorrow")} · ${fmtDate(locale, tc, date, "dayMonth")}`;
    return fmtDate(locale, tc, date, "weekday");
  };

  const row = (a: Appointment) => {
    const p = patients[a.patientId];
    const name = p ? `${p.firstName} ${p.lastName}` : a.patientId;
    return (
      <Link
        key={a.id}
        href={`/doctor/appointments/${a.id}`}
        className="flex items-center gap-3 px-3 py-3 hover:bg-surface transition-colors min-h-[64px]"
      >
        <div className="w-12 shrink-0 text-center">
          <div className="font-bold text-heading">{a.time}</div>
          <div className="text-[11px] text-muted">{tc("min", { count: a.durationMin })}</div>
        </div>
        <Avatar src={p?.avatarUrl} name={name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-heading truncate">{name}</div>
          <div className="text-xs text-muted truncate">{a.reason ?? t("noReason")}</div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {a.status === "completed" && !a.summary && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-accent font-semibold">
              <ClipboardList className="h-3.5 w-3.5" /> {t("writeSummary")}
            </span>
          )}
          <AppointmentStatusBadge status={a.status} />
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {(["all", "scheduled", "completed", "cancelled", "no_show"] as const).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)} className="min-h-[36px]">
              {s === "all" ? t("all") : tstatus(s)}
            </Chip>
          ))}
        </div>
        <div className="sm:ml-auto inline-flex rounded-lg border border-line bg-card p-0.5 self-start" role="group" aria-label={t("cal.viewLabel")}>
          {views.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => go({ view: key })}
              className={cn("h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-sm font-medium", view === key ? "bg-primary text-white" : "text-muted")}
            >
              <Icon className="h-4 w-4" /> {t(key)}
            </button>
          ))}
        </div>
      </div>

      {state === "loading" ? (
        <ListSkeleton rows={4} />
      ) : state === "error" ? (
        <ErrorState title={tst("errorTitle")} description={tst("errorDesc")} action={<RetryButton />} />
      ) : view === "list" ? (
        groups.length === 0 ? (
          <EmptyState icon={<CalendarDays className="h-7 w-7" />} title={t("noAppointments")} description={t("noAppointmentsDesc")} />
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map(([date, list]) => (
              <section key={date}>
                <h3 className={cn("text-sm font-bold mb-2 capitalize", isToday(date) ? "text-primary-text" : "text-heading")}>{dayTitle(date)}</h3>
                <div className="bg-card rounded-xl shadow-card border border-line/60 divide-y divide-line overflow-hidden">{list.map(row)}</div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <button type="button" aria-label={t(view === "month" ? "cal.prevMonth" : "prevWeek")} onClick={() => step(-1)} className="h-10 w-10 shrink-0 rounded-lg hover:bg-surface flex items-center justify-center">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label={t(view === "month" ? "cal.nextMonth" : "nextWeek")} onClick={() => step(1)} className="h-10 w-10 shrink-0 rounded-lg hover:bg-surface flex items-center justify-center">
              <ChevronRight className="h-5 w-5" />
            </button>
            <h3 className="min-w-0 flex-1 truncate px-1 font-bold text-heading" aria-live="polite">
              {view === "month" ? fmtMonthYear(tc, date) : `${fmtDate(locale, tc, days[0], "short")} — ${fmtDate(locale, tc, days[6], "short")}, ${days[6].slice(0, 4)}`}
            </h3>
            <Button size="sm" variant="secondary" disabled={onToday && date === today()} onClick={() => go({ date: today() })}>
              {tc("today")}
            </Button>
          </div>

          {view === "week" ? (
            <WeekGrid days={days} focus={date} appointments={filtered} patients={patients} schedule={schedule} onOpen={setOpened} />
          ) : (
            <MonthGrid weeks={weeks} month={date.slice(0, 7)} appointments={filtered} patients={patients} onPickDay={(d) => go({ view: "week", date: d })} />
          )}

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted" aria-label={t("cal.legend")}>
            {(["scheduled", "completed", "no_show", "cancelled"] as const).map((s) => (
              <li key={s} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", { scheduled: "bg-primary", completed: "bg-success", no_show: "bg-danger", cancelled: "bg-muted/50" }[s])} /> {tstatus(s)}
              </li>
            ))}
            {view === "week" && (
              <>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded-sm border border-line bg-success-soft/70" /> {t("cal.free")}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded-sm border border-line bg-[repeating-linear-gradient(135deg,transparent_0,transparent_2px,var(--color-muted)_2px,var(--color-muted)_3px)]" /> {t("cal.break")}
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      <AppointmentSheet appointment={opened} patient={opened ? patients[opened.patientId] : undefined} onClose={() => setOpened(null)} />
    </div>
  );
}
