import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AlertTriangle, CalendarClock, CalendarDays, ChevronRight, Clock, FolderHeart, MapPin, MessageCircle, Pill, Search, Star, Stethoscope, Upload } from "lucide-react";
import { currentPatient } from "@projectx/mock/users";
import { getDoctorById } from "@projectx/mock/doctors";
import { getPatientAppointments } from "@projectx/mock/appointments";
import { getPatientRecords, getUrgentRecords } from "@projectx/mock/records";
import { getMedicationLogs } from "@projectx/mock/medications";
import { patientChats } from "@projectx/mock/chats";
import { hoursUntil, isToday } from "@projectx/utils";
import { fmtDate, today } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge, NewBadge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card, StatCard } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { IconBox } from "@projectx/ui/IconBox";
import { SectionHeader } from "@projectx/ui/PageHeader";
import { FirstRunGuide } from "@projectx/ui/help/FirstRunGuide";
import { TodayMedsCard } from "@projectx/ui/meds/TodayMedsCard";
import { isActiveOn, isRegularMedication } from "@projectx/ui/meds/medications";

export default async function PatientDashboard() {
  const t = await getTranslations("patient.dashboard");
  const tc = await getTranslations("common");
  const ts = await getTranslations("specialties");
  const tsh = await getTranslations("shell");
  const locale = await getLocale();

  const all = getPatientAppointments(currentPatient.id);
  const upcoming = all
    .filter((a) => a.status === "scheduled" && hoursUntil(a.date, a.time) > -1)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const next = upcoming[0];
  const nextDoctor = next ? getDoctorById(next.doctorId) : undefined;
  const needsReview = all.filter((a) => a.status === "completed" && !a.reviewId);
  const newRecords = getPatientRecords(currentPatient.id).filter((r) => r.isNew);
  const urgent = getUrgentRecords(currentPatient.id).sort((a, b) => b.date.localeCompare(a.date))[0];
  const unread = patientChats.reduce((s, c) => s + c.unreadCount, 0);
  const newSummaries = newRecords.filter((r) => r.type === "summary");
  const lastCompleted = all
    .filter((a) => a.status === "completed")
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))[0];
  const lastDoctor = lastCompleted ? getDoctorById(lastCompleted.doctorId) : undefined;
  const records = getPatientRecords(currentPatient.id);
  // Today's doses as prescribed; what was already taken is counted by the card below (it knows this browser's ticks).
  const doseTimes = records
    .filter(isRegularMedication)
    .filter((m) => isActiveOn(m.schedule, today()))
    .flatMap((m) => m.schedule.times)
    .sort();
  const fullName = `${currentPatient.firstName} ${currentPatient.lastName}`;
  const nextDay = next ? (isToday(next.date) ? t("today") : fmtDate(locale, tc, next.date, "weekday")) : "";

  return (
    <>
      <FirstRunGuide />

      {/* Greeting */}
      <header className="mb-5 flex items-center gap-4 md:mb-6">
        <Avatar src={currentPatient.avatarUrl} name={fullName} size="lg" ring className="max-md:h-14 max-md:w-14" />
        <div className="min-w-0 flex-1">
          <h1 className="text-h2 text-primary-900 md:text-h1">{tsh("greeting", { name: currentPatient.firstName })}</h1>
          <p className="mt-1 text-sm capitalize text-muted md:text-base">{fmtDate(locale, tc, today(), "weekday")}</p>
        </div>
        <Button href="/patient/doctors" icon={<Search />} className="max-md:hidden">
          {t("findDoctor")}
        </Button>
      </header>

      {urgent && (
        <div role="alert" className="mb-5 flex flex-col gap-3 rounded-lg border border-danger-500/30 bg-danger-50 p-4 sm:flex-row sm:items-center md:p-5">
          <IconBox tone="danger" size="lg" active className="bg-danger-600">
            <AlertTriangle />
          </IconBox>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-heading">{t("urgentTitle")}</div>
            <div className="mt-0.5 text-sm text-danger-700">{t("urgentBanner", { doctor: urgent.authorName ?? "", title: urgent.title })}</div>
          </div>
          <Button href={`/patient/records#record-${urgent.id}`} variant="danger" size="sm" className="shrink-0">
            {t("view")}
          </Button>
        </div>
      )}

      {/* Today at a glance */}
      <section aria-label={t("todaySummary")} className="mb-6 grid grid-cols-3 gap-2 sm:gap-3 md:mb-8 md:gap-4">
        <StatCard
          compact
          href={next ? `/patient/appointments/${next.id}` : "/patient/doctors"}
          label={t("nextAppointment")}
          value={next ? next.time : "—"}
          hint={next && nextDoctor ? `${nextDay} · ${ts(nextDoctor.specialty)}` : t("noAppointmentShort")}
          icon={<CalendarClock />}
        />
        <StatCard
          compact
          href="/patient/records"
          label={t("medsToday")}
          value={doseTimes.length}
          hint={doseTimes.length ? [...new Set(doseTimes)].join(" · ") : t("medsNone")}
          icon={<Pill />}
          tone="success"
        />
        <StatCard
          compact
          href="/patient/chat"
          label={t("newMessages")}
          value={unread}
          hint={unread > 0 ? t("from", { name: patientChats[0].participantName }) : t("noMessages")}
          icon={<MessageCircle />}
          tone="warning"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TodayMedsCard patientId={currentPatient.id} records={records} logs={getMedicationLogs(currentPatient.id)} serverToday={today()} />

          {/* Next appointment */}
          <section>
            <SectionHeader
              action={
                <Link href="/patient/appointments" className="inline-flex min-h-[32px] items-center text-sm font-semibold text-primary-700 hover:underline">
                  {tc("viewAll")} <ChevronRight className="h-4 w-4" />
                </Link>
              }
            >
              {next && isToday(next.date) ? t("today") : t("nextAppointment")}
            </SectionHeader>
            {next && nextDoctor ? (
              <Card href={`/patient/appointments/${next.id}`} accent="primary" className="flex items-center gap-4 md:gap-5">
                <Avatar src={nextDoctor.avatarUrl} name={`${nextDoctor.firstName} ${nextDoctor.lastName}`} size="xl" shape="square" className="max-md:h-[72px] max-md:w-[72px]" />
                <div className="min-w-0 flex-1">
                  {/* The day is plain text so a long one can wrap; only the hour is a badge. */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold capitalize text-primary-700">{nextDay}</span>
                    <Badge tone="primary">
                      <Clock className="h-3.5 w-3.5" /> {next.time}
                    </Badge>
                    {isToday(next.date) && <Badge tone="warning">{t("inHours", { count: Math.max(0, Math.round(hoursUntil(next.date, next.time))) })}</Badge>}
                  </div>
                  <div className="mt-2 font-display text-lg font-bold leading-tight text-heading md:text-h3">
                    {nextDoctor.firstName} {nextDoctor.lastName}
                  </div>
                  <div className="text-sm font-medium text-primary-700">{ts(nextDoctor.specialty)}</div>
                  <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted">
                    <MapPin className="h-4 w-4 shrink-0" /> <span className="truncate">{nextDoctor.clinicName}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
              </Card>
            ) : (
              <EmptyState
                illustration="appointments"
                title={t("noAppointmentTitle")}
                description={t("noAppointmentDesc")}
                action={<Button href="/patient/doctors">{t("findDoctor")}</Button>}
              />
            )}
          </section>

          {/* Pending from you */}
          {needsReview.length > 0 && (
            <section>
              <SectionHeader>{t("pendingFromYou")}</SectionHeader>
              <div className="flex flex-col gap-3">
                {needsReview.slice(0, 2).map((a) => {
                  const d = getDoctorById(a.doctorId);
                  if (!d) return null;
                  return (
                    <Card key={a.id} href={`/patient/review/${a.id}`} padding="sm" className="flex items-center gap-3.5">
                      <IconBox tone="warning">
                        <Star />
                      </IconBox>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-heading">{t("leaveReview")}</div>
                        <div className="truncate text-sm text-muted">{t("leaveReviewDesc", { doctor: `${d.firstName} ${d.lastName}` })}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
                    </Card>
                  );
                })}
                {lastDoctor && (
                  <Card href="/patient/records" padding="sm" className="flex items-center gap-3.5">
                    <IconBox>
                      <Upload />
                    </IconBox>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-heading">{t("uploadResults")}</div>
                      <div className="truncate text-sm text-muted">{t("uploadResultsDesc", { doctor: `${lastDoctor.firstName} ${lastDoctor.lastName}` })}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
                  </Card>
                )}
              </div>
            </section>
          )}
        </div>

        {/* New records + quick actions */}
        <div className="flex flex-col gap-6">
          <section>
            <SectionHeader>{t("newRecords")}</SectionHeader>
            {newRecords.length === 0 && unread === 0 ? (
              <EmptyState compact illustration="records" title={t("noNewRecords")} description={t("noNewRecordsDesc")} />
            ) : (
              <Card padding="none" className="divide-y divide-line overflow-hidden">
                {newSummaries.map((r) => (
                  <Link key={r.id} href="/patient/records" className="flex items-center gap-3 p-4 transition-colors hover:bg-neutral-50">
                    <IconBox size="md">
                      <Stethoscope />
                    </IconBox>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-heading">{t("newSummary")}</div>
                      <div className="truncate text-xs text-muted">{t("from", { name: r.authorName ?? "" })}</div>
                    </div>
                    <NewBadge label={tc("new")} />
                  </Link>
                ))}
                {unread > 0 && (
                  <Link href="/patient/chat" className="flex items-center gap-3 p-4 transition-colors hover:bg-neutral-50">
                    <IconBox size="md" tone="warning">
                      <MessageCircle />
                    </IconBox>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-heading">{t("newMessage", { count: unread })}</div>
                      <div className="truncate text-xs text-muted">{t("from", { name: patientChats[0].participantName })}</div>
                    </div>
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-pill bg-danger-600 px-1.5 text-xs font-bold text-white">{unread}</span>
                  </Link>
                )}
                {newRecords
                  .filter((r) => r.type !== "summary")
                  .slice(0, 2)
                  .map((r) => (
                    <Link key={r.id} href="/patient/records" className="flex items-center gap-3 p-4 transition-colors hover:bg-neutral-50">
                      <IconBox size="md" tone="success">
                        <FolderHeart />
                      </IconBox>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-heading">{t("newRecord")}</div>
                        <div className="truncate text-xs text-muted">{r.title}</div>
                      </div>
                    </Link>
                  ))}
              </Card>
            )}
          </section>

          <section>
            <SectionHeader>{t("quickActions")}</SectionHeader>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction href="/patient/doctors" icon={<Search />} label={t("findDoctor")} className="md:hidden" />
              <QuickAction href="/patient/appointments" icon={<CalendarDays />} label={t("myAppointments")} />
              <QuickAction href="/patient/records" icon={<FolderHeart />} label={t("myRecords")} />
              <QuickAction href="/patient/chat" icon={<MessageCircle />} label={t("myChats")} className="max-md:hidden" />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function QuickAction({ href, icon, label, className }: { href: string; icon: React.ReactNode; label: string; className?: string }) {
  return (
    <Card href={href} padding="sm" className={className}>
      <span className="flex flex-col items-center gap-2.5 py-2 text-center">
        <IconBox>{icon}</IconBox>
        <span className="text-sm font-semibold text-heading">{label}</span>
      </span>
    </Card>
  );
}
