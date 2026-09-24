import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AlertTriangle, CalendarDays, ChevronRight, FolderHeart, MapPin, MessageCircle, Search, Star, Stethoscope, Upload } from "lucide-react";
import { currentPatient } from "@projectx/mock/users";
import { getDoctorById } from "@projectx/mock/doctors";
import { getPatientAppointments } from "@projectx/mock/appointments";
import { getPatientRecords, getUrgentRecords } from "@projectx/mock/records";
import { patientChats } from "@projectx/mock/chats";
import { hoursUntil, isToday } from "@projectx/utils";
import { fmtDate, today } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { FirstRunGuide } from "@projectx/ui/help/FirstRunGuide";

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

  return (
    <>
      <FirstRunGuide />
      <PageHeader
        title={tsh("greeting", { name: currentPatient.firstName })}
        subtitle={fmtDate(locale, tc, today(), "weekday")}
        actions={
          <Button href="/patient/doctors" icon={<Search className="h-4 w-4" />} className="max-md:hidden">
            {t("findDoctor")}
          </Button>
        }
      />

      {urgent && (
        <div role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-danger/40 bg-danger-soft p-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-danger text-white">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-heading">{t("urgentTitle")}</div>
            <div className="text-sm text-red-800">{t("urgentBanner", { doctor: urgent.authorName ?? "", title: urgent.title })}</div>
          </div>
          <Button href={`/patient/records#record-${urgent.id}`} variant="danger" size="sm" className="shrink-0">
            {t("view")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today / next appointment */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <section>
            <SectionTitle
              action={
                <Link href="/patient/appointments" className="text-sm text-primary-text font-medium inline-flex items-center">
                  {tc("viewAll")} <ChevronRight className="h-4 w-4" />
                </Link>
              }
            >
              {next && isToday(next.date) ? t("today") : t("nextAppointment")}
            </SectionTitle>
            {next && nextDoctor ? (
              <Card href={`/patient/appointments/${next.id}`} className="gradient-primary text-white border-0">
                <div className="flex items-center gap-3">
                  <Avatar src={nextDoctor.avatarUrl} name={`${nextDoctor.firstName} ${nextDoctor.lastName}`} size="lg" ring />
                  <div className="min-w-0 flex-1">
                    <div className="text-white/85 text-sm capitalize">
                      {isToday(next.date) ? t("today") : fmtDate(locale, tc, next.date, "weekday")} · {t("at", { time: next.time })}
                    </div>
                    <div className="font-bold text-lg leading-tight text-white truncate">
                      {nextDoctor.firstName} {nextDoctor.lastName}
                    </div>
                    <div className="text-white/90 text-sm">{ts(nextDoctor.specialty)}</div>
                    <div className="text-white/85 text-xs inline-flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3 w-3" /> {nextDoctor.clinicName}
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-white/80 shrink-0" />
                </div>
                {isToday(next.date) && (
                  <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    {t("inHours", { count: Math.max(0, Math.round(hoursUntil(next.date, next.time))) })}
                  </div>
                )}
              </Card>
            ) : (
              <EmptyState
                icon={<CalendarDays className="h-7 w-7" />}
                title={t("noAppointmentTitle")}
                description={t("noAppointmentDesc")}
                action={<Button href="/patient/doctors">{t("findDoctor")}</Button>}
              />
            )}
          </section>

          {/* Pending from you */}
          {needsReview.length > 0 && (
            <section>
              <SectionTitle>{t("pendingFromYou")}</SectionTitle>
              <div className="flex flex-col gap-2">
                {needsReview.slice(0, 2).map((a) => {
                  const d = getDoctorById(a.doctorId);
                  if (!d) return null;
                  return (
                    <Card key={a.id} href={`/patient/review/${a.id}`} padding="sm" className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
                        <Star className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-heading">{t("leaveReview")}</div>
                        <div className="text-sm text-muted truncate">{t("leaveReviewDesc", { doctor: `${d.firstName} ${d.lastName}` })}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted shrink-0" />
                    </Card>
                  );
                })}
                {lastDoctor && (
                  <Card href="/patient/records" padding="sm" className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                      <Upload className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-heading">{t("uploadResults")}</div>
                      <div className="text-sm text-muted truncate">{t("uploadResultsDesc", { doctor: `${lastDoctor.firstName} ${lastDoctor.lastName}` })}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted shrink-0" />
                  </Card>
                )}
              </div>
            </section>
          )}
        </div>

        {/* New for you + quick actions */}
        <div className="flex flex-col gap-4">
          <section>
            <SectionTitle>{t("newForYou")}</SectionTitle>
            <Card padding="none" className="divide-y divide-line">
              {newSummaries.map((r) => (
                <Link key={r.id} href="/patient/records" className="flex items-center gap-3 p-4 hover:bg-surface">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-accent text-white">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-heading text-sm">{t("newSummary")}</div>
                    <div className="text-xs text-muted truncate">{t("from", { name: r.authorName ?? "" })}</div>
                  </div>
                  <Badge tone="accent">{tc("new")}</Badge>
                </Link>
              ))}
              {unread > 0 && (
                <Link href="/patient/chat" className="flex items-center gap-3 p-4 hover:bg-surface">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-heading text-sm">{t("newMessage", { count: unread })}</div>
                    <div className="text-xs text-muted truncate">{t("from", { name: patientChats[0].participantName })}</div>
                  </div>
                  <span className="h-6 min-w-[24px] rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center px-1.5">{unread}</span>
                </Link>
              )}
              {newRecords
                .filter((r) => r.type !== "summary")
                .slice(0, 2)
                .map((r) => (
                  <Link key={r.id} href="/patient/records" className="flex items-center gap-3 p-4 hover:bg-surface">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
                      <FolderHeart className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-heading text-sm">{t("newRecord")}</div>
                      <div className="text-xs text-muted truncate">{r.title}</div>
                    </div>
                  </Link>
                ))}
            </Card>
          </section>

          <section>
            <SectionTitle>{t("quickActions")}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Card href="/patient/doctors" padding="sm" className="flex flex-col items-center text-center gap-2 py-5 md:hidden">
                <Search className="h-6 w-6 text-primary-text" />
                <span className="text-sm font-semibold">{t("findDoctor")}</span>
              </Card>
              <Card href="/patient/appointments" padding="sm" className="flex flex-col items-center text-center gap-2 py-5">
                <CalendarDays className="h-6 w-6 text-primary-text" />
                <span className="text-sm font-semibold">{t("myAppointments")}</span>
              </Card>
              <Card href="/patient/records" padding="sm" className="flex flex-col items-center text-center gap-2 py-5">
                <FolderHeart className="h-6 w-6 text-primary-text" />
                <span className="text-sm font-semibold">{t("myRecords")}</span>
              </Card>
              <Card href="/patient/chat" padding="sm" className="flex flex-col items-center text-center gap-2 py-5 hidden md:flex">
                <MessageCircle className="h-6 w-6 text-primary-text" />
                <span className="text-sm font-semibold">{t("myChats")}</span>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
