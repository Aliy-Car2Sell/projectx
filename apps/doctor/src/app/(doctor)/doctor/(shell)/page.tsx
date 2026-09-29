import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, ChevronRight, Clock, ClipboardList, MessageCircle, ShieldAlert, Star, Users } from "lucide-react";
import { currentDoctor } from "@projectx/mock/doctors";
import { getDoctorAppointments } from "@projectx/mock/appointments";
import { getDoctorPatients } from "@projectx/mock/patients";
import { doctorChats } from "@projectx/mock/chats";
import { users } from "@projectx/mock/users";
import { hoursUntil, isToday, isoDateFromNow } from "@projectx/utils";
import { fmtDate, today } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card, StatCard } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { IconBox } from "@projectx/ui/IconBox";
import { SectionHeader } from "@projectx/ui/PageHeader";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { cn } from "@projectx/utils";
import { statusDot } from "@/components/doctor/calendar/calendar";

export default async function DoctorDashboard({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const t = await getTranslations("doctor.dashboard");
  const tc = await getTranslations("common");
  const tsh = await getTranslations("shell");
  const locale = await getLocale();

  const all = getDoctorAppointments(currentDoctor.id);
  const todays = all.filter((a) => isToday(a.date)).sort((a, b) => a.time.localeCompare(b.time));
  const weekEnd = isoDateFromNow(7);
  const weekCount = all.filter((a) => a.date >= today() && a.date <= weekEnd && a.status === "scheduled").length;
  const patients = getDoctorPatients(currentDoctor.id);
  const unread = doctorChats.reduce((s, c) => s + c.unreadCount, 0);
  const pending = state === "pending" || currentDoctor.status === "pending";
  const nextUp = todays.find((a) => a.status === "scheduled" && hoursUntil(a.date, a.time) > -0.5);
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const fullName = `${currentDoctor.firstName} ${currentDoctor.lastName}`;

  return (
    <>
      {/* Greeting */}
      <header className="mb-5 flex items-center gap-4 md:mb-6">
        <Avatar src={currentDoctor.avatarUrl} name={fullName} size="lg" ring className="max-md:h-14 max-md:w-14" />
        <div className="min-w-0 flex-1">
          <h1 className="text-h2 text-primary-900 md:text-h1">{tsh("greeting", { name: currentDoctor.firstName })}</h1>
          <p className="mt-1 text-sm capitalize text-muted md:text-base">{fmtDate(locale, tc, today(), "weekday")}</p>
        </div>
        <Button href="/doctor/schedule" variant="secondary" icon={<Clock />} className="max-md:hidden">
          {t("viewSchedule")}
        </Button>
      </header>

      {pending && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-warning-500/40 bg-warning-50 p-4 sm:flex-row sm:items-center md:p-5">
          <IconBox tone="warning" size="lg" active className="bg-warning-700">
            <ShieldAlert />
          </IconBox>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-heading">{t("verificationTitle")}</div>
            <div className="mt-0.5 text-sm text-warning-700">{t("verificationDesc")}</div>
          </div>
          <Button href="/doctor/onboarding" variant="secondary" size="sm" className="shrink-0">
            {t("completeProfile")}
          </Button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
        <StatCard compact href="/doctor/appointments" label={t("statToday")} value={todays.length} hint={t("appointmentsUnit", { count: todays.length })} icon={<CalendarDays />} tone="accent" />
        <StatCard compact href="/doctor/schedule" label={t("statWeek")} value={weekCount} hint={t("appointmentsUnit", { count: weekCount })} icon={<Clock />} />
        <StatCard compact href="/doctor/reviews" label={t("statRating")} value={currentDoctor.rating.toFixed(1)} hint={tc("reviews", { count: currentDoctor.reviewCount })} icon={<Star />} tone="warning" />
        <StatCard compact href="/doctor/patients" label={t("statPatients")} value={patients.length} icon={<Users />} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader
            action={
              <Link href="/doctor/appointments" className="inline-flex min-h-[32px] items-center text-sm font-semibold text-primary-700 hover:underline">
                {t("allAppointments")} <ChevronRight className="h-4 w-4" />
              </Link>
            }
          >
            {t("todayAppointments")}
          </SectionHeader>
          {todays.length === 0 ? (
            <EmptyState illustration="appointments" title={t("noToday")} description={t("noTodayDesc")} action={<Button href="/doctor/schedule">{t("viewSchedule")}</Button>} />
          ) : (
            /* The day as a timeline: the hour on the left, a dot on the line, the appointment as a card. */
            <ol className="relative flex flex-col gap-3 before:absolute before:bottom-6 before:left-[63px] before:top-6 before:w-0.5 before:rounded-pill before:bg-neutral-200 md:before:left-[75px]">
              {todays.map((a) => {
                const p = userMap[a.patientId];
                const name = p ? `${p.firstName} ${p.lastName}` : a.patientId;
                const isNext = nextUp?.id === a.id;
                return (
                  <li key={a.id} className="relative grid grid-cols-[48px_32px_minmax(0,1fr)] md:grid-cols-[60px_32px_minmax(0,1fr)]">
                    <div className={cn("pt-[18px] text-right font-display font-bold tabular-nums leading-none", isNext ? "text-accent-700" : a.status === "scheduled" ? "text-heading" : "text-neutral-500")}>
                      {a.time}
                    </div>
                    <div className="flex justify-center pt-5" aria-hidden="true">
                      <span className={cn("h-3 w-3 rounded-pill ring-4 ring-surface", isNext ? "bg-accent-500" : statusDot[a.status])} />
                    </div>
                    <Link
                      href={`/doctor/appointments/${a.id}`}
                      className={cn(
                        "lift flex min-h-[64px] items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm",
                        isNext ? "border-accent-300 ring-1 ring-accent-300" : "border-neutral-200/70 hover:border-primary-200",
                      )}
                    >
                      <Avatar src={p?.avatarUrl} name={name} size="sm" className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="min-w-0 [overflow-wrap:anywhere] font-semibold text-heading">{name}</span>
                          {isNext && <Badge tone="accent">{t("next")}</Badge>}
                        </div>
                        <div className="truncate text-sm text-muted">{a.reason ?? "—"}</div>
                        {a.status === "completed" && !a.summary && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent-700">
                            <ClipboardList className="h-3.5 w-3.5" /> {t("writeSummary")}
                          </span>
                        )}
                      </div>
                      <span className="max-sm:hidden">
                        <AppointmentStatusBadge status={a.status} />
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section>
          <SectionHeader>{t("quickLinks")}</SectionHeader>
          <div className="flex flex-col gap-3">
            <Card href="/doctor/chat" padding="sm" className="flex items-center gap-3.5">
              <IconBox>
                <MessageCircle />
              </IconBox>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{t("newMessages", { count: unread })}</div>
                <div className="truncate text-sm text-muted">
                  {doctorChats[1].participantName}: {doctorChats[1].lastMessage}
                </div>
              </div>
              {unread > 0 && <span className="flex h-6 min-w-[24px] items-center justify-center rounded-pill bg-danger-600 px-1.5 text-xs font-bold text-white">{unread}</span>}
            </Card>
            <Card href="/doctor/reviews" padding="sm" className="flex items-center gap-3.5">
              <IconBox tone="warning">
                <Star />
              </IconBox>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{t("myReviews")}</div>
                <div className="text-sm text-muted">
                  {currentDoctor.rating.toFixed(1)} · {tc("reviews", { count: currentDoctor.reviewCount })}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
            </Card>
            <Card href="/doctor/patients" padding="sm" className="flex items-center gap-3.5">
              <IconBox tone="success">
                <Users />
              </IconBox>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{t("statPatients")}</div>
                <div className="text-sm text-muted">
                  {patients.filter((p) => p.hasActive).length} / {patients.length}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
