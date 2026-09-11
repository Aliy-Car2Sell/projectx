"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, List } from "lucide-react";
import type { Appointment, AppointmentStatus, User } from "@/types";
import { cn, isoDateFromNow, isToday, toIsoDate, weekdayKey } from "@/lib/utils";
import { fmtDate } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { RetryButton } from "@/components/ui/RetryButton";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import type { DemoState } from "@/components/demo/state";

const statusTone: Record<AppointmentStatus, string> = {
  scheduled: "bg-primary-soft text-primary border-primary/30",
  completed: "bg-success-soft text-green-700 border-success/30",
  cancelled: "bg-surface text-muted border-line line-through",
  no_show: "bg-danger-soft text-red-700 border-danger/30",
};

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function DoctorAppointments({
  appointments,
  patients,
  state = "normal",
}: {
  appointments: Appointment[];
  patients: Record<string, User>;
  state?: DemoState;
}) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const tst = useTranslations("states");
  const tstatus = useTranslations("status.appointment");
  const locale = useLocale();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [weekOffset, setWeekOffset] = useState(0);

  const filtered = useMemo(
    () =>
      (state === "empty" ? [] : appointments)
        .filter((a) => status === "all" || a.status === status)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [appointments, status, state],
  );

  const weekStart = useMemo(() => {
    const m = mondayOf(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return toIsoDate(d);
  });

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
        <div className="sm:ml-auto inline-flex rounded-lg border border-line bg-card p-0.5 self-start">
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={cn("h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-sm font-medium", view === "list" ? "bg-primary text-white" : "text-muted")}>
            <List className="h-4 w-4" /> {t("list")}
          </button>
          <button type="button" aria-pressed={view === "calendar"} onClick={() => setView("calendar")} className={cn("h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-sm font-medium", view === "calendar" ? "bg-primary text-white" : "text-muted")}>
            <CalendarDays className="h-4 w-4" /> {t("calendar")}
          </button>
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
                <h3 className={cn("text-sm font-bold mb-2 capitalize", isToday(date) ? "text-primary" : "text-heading")}>{dayTitle(date)}</h3>
                <div className="bg-card rounded-xl shadow-card border border-line/60 divide-y divide-line overflow-hidden">{list.map(row)}</div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button type="button" aria-label={t("prevWeek")} onClick={() => setWeekOffset((w) => w - 1)} className="h-10 w-10 rounded-lg hover:bg-surface flex items-center justify-center">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="font-bold text-heading">
                {fmtDate(locale, tc, weekDays[0], "short")} — {fmtDate(locale, tc, weekDays[6], "short")}
              </div>
              {weekOffset !== 0 && (
                <button type="button" className="text-xs text-primary font-medium" onClick={() => setWeekOffset(0)}>
                  {t("thisWeek")}
                </button>
              )}
            </div>
            <button type="button" aria-label={t("nextWeek")} onClick={() => setWeekOffset((w) => w + 1)} className="h-10 w-10 rounded-lg hover:bg-surface flex items-center justify-center">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop: 7-column grid; mobile: stacked days */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const list = filtered.filter((a) => a.date === date);
              const today = isToday(date);
              return (
                <div key={date} className={cn("rounded-xl border bg-card p-2 min-h-[64px] md:min-h-[260px]", today ? "border-primary" : "border-line/60")}>
                  <div className={cn("flex md:flex-col items-baseline md:items-center gap-1 mb-2 px-1", today ? "text-primary" : "text-heading")}>
                    <span className="text-xs uppercase text-muted">{tc(`weekdaysShort.${weekdayKey(date)}`)}</span>
                    <span className="font-bold">{Number(date.slice(8, 10))}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {list.length === 0 && <div className="text-xs text-muted px-1 md:text-center">—</div>}
                    {list.map((a) => {
                      const p = patients[a.patientId];
                      return (
                        <Link key={a.id} href={`/doctor/appointments/${a.id}`} className={cn("rounded-md border px-2 py-1 text-xs leading-tight hover:opacity-90", statusTone[a.status])}>
                          <div className="font-bold">{a.time}</div>
                          <div className="truncate">{p ? `${p.firstName} ${p.lastName[0]}.` : a.patientId}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
