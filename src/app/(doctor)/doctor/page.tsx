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
import { Button } from "@projectx/ui/Button";
import { Card, StatCard } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";

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

  return (
    <>
      <PageHeader
        title={tsh("greeting", { name: currentDoctor.firstName })}
        subtitle={fmtDate(locale, tc, today(), "weekday")}
        actions={
          <Button href="/doctor/schedule" variant="secondary" icon={<Clock className="h-4 w-4" />} className="max-md:hidden">
            {t("viewSchedule")}
          </Button>
        }
      />

      {pending && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning-soft p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-warning text-white">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-heading">{t("verificationTitle")}</div>
            <div className="text-sm text-amber-800">{t("verificationDesc")}</div>
          </div>
          <Button href="/doctor/onboarding" variant="secondary" size="sm" className="shrink-0">
            {t("completeProfile")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label={t("statToday")} value={todays.length} hint={t("appointmentsUnit", { count: todays.length })} icon={<CalendarDays className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("statWeek")} value={weekCount} hint={t("appointmentsUnit", { count: weekCount })} icon={<Clock className="h-5 w-5" />} tone="white" />
        <StatCard label={t("statRating")} value={currentDoctor.rating.toFixed(1)} hint={tc("reviews", { count: currentDoctor.reviewCount })} icon={<Star className="h-5 w-5" />} tone="accent" />
        <StatCard label={t("statPatients")} value={patients.length} icon={<Users className="h-5 w-5" />} tone="white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <SectionTitle
            action={
              <Link href="/doctor/appointments" className="text-sm text-primary font-medium inline-flex items-center">
                {t("allAppointments")} <ChevronRight className="h-4 w-4" />
              </Link>
            }
          >
            {t("todayAppointments")}
          </SectionTitle>
          {todays.length === 0 ? (
            <EmptyState icon={<CalendarDays className="h-7 w-7" />} title={t("noToday")} description={t("noTodayDesc")} action={<Button href="/doctor/schedule">{t("viewSchedule")}</Button>} />
          ) : (
            <Card padding="none" className="divide-y divide-line overflow-hidden">
              {todays.map((a) => {
                const p = userMap[a.patientId];
                const name = p ? `${p.firstName} ${p.lastName}` : a.patientId;
                const isNext = nextUp?.id === a.id;
                return (
                  <Link key={a.id} href={`/doctor/appointments/${a.id}`} className={`flex items-center gap-3 px-4 py-3 hover:bg-surface min-h-[64px] ${isNext ? "bg-primary-soft/50" : ""}`}>
                    <div className="w-12 shrink-0 text-center">
                      <div className={`font-bold ${isNext ? "text-primary" : "text-heading"}`}>{a.time}</div>
                      {isNext && <div className="text-[10px] font-semibold uppercase text-primary">{t("next")}</div>}
                    </div>
                    <Avatar src={p?.avatarUrl} name={name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-heading truncate">{name}</div>
                      <div className="text-xs text-muted truncate">{a.reason ?? "—"}</div>
                    </div>
                    {a.status === "completed" && !a.summary ? (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-accent">
                        <ClipboardList className="h-3.5 w-3.5" /> {t("writeSummary")}
                      </span>
                    ) : null}
                    <AppointmentStatusBadge status={a.status} />
                  </Link>
                );
              })}
            </Card>
          )}
        </section>

        <section>
          <SectionTitle>{t("quickLinks")}</SectionTitle>
          <div className="flex flex-col gap-2">
            <Card href="/doctor/chat" padding="sm" className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{t("newMessages", { count: unread })}</div>
                <div className="text-sm text-muted truncate">{doctorChats[1].participantName}: {doctorChats[1].lastMessage}</div>
              </div>
              {unread > 0 && <span className="h-6 min-w-[24px] rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center px-1.5">{unread}</span>}
            </Card>
            <Card href="/doctor/reviews" padding="sm" className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg gradient-accent text-white">
                <Star className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{t("myReviews")}</div>
                <div className="text-sm text-muted">{currentDoctor.rating.toFixed(1)} · {tc("reviews", { count: currentDoctor.reviewCount })}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted" />
            </Card>
            <Card href="/doctor/patients" padding="sm" className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
                <Users className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-heading">{t("statPatients")}</div>
                <div className="text-sm text-muted">{patients.filter((p) => p.hasActive).length} / {patients.length}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted" />
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
