import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarClock, ClipboardList, FolderHeart, MapPin, MessageCircle, Phone, Star, Stethoscope } from "lucide-react";
import { getAppointmentById } from "@projectx/mock/appointments";
import { getDoctorById } from "@projectx/mock/doctors";
import { chatHrefFor } from "@projectx/mock/chats";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { MapView } from "@projectx/ui/map/MapView";

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apt = getAppointmentById(id);
  const doctor = apt ? getDoctorById(apt.doctorId) : undefined;
  if (!apt || !doctor) notFound();

  const t = await getTranslations("patient.appointments");
  const tc = await getTranslations("common");
  const ts = await getTranslations("specialties");
  const locale = await getLocale();
  const name = `${doctor.firstName} ${doctor.lastName}`;

  return (
    <>
      <PageHeader title={t("details")} backHref="/patient/appointments" backLabel={tc("back")} actions={<AppointmentStatusBadge status={apt.status} />} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <Link href={`/patient/doctors/${doctor.id}`}>
                <Avatar src={doctor.avatarUrl} name={name} size="lg" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/patient/doctors/${doctor.id}`} className="font-bold text-heading text-lg hover:text-primary block truncate">
                  {name}
                </Link>
                <div className="text-sm text-primary">{ts(doctor.specialty)}</div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" /> {tc("date")}
              </dt>
              <dd className="font-semibold text-heading capitalize">
                {fmtDate(locale, tc, apt.date, "weekday")} · {apt.time}
              </dd>
              <dt className="text-muted">{t("duration")}</dt>
              <dd className="text-heading">{tc("min", { count: apt.durationMin })}</dd>
              <dt className="text-muted inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {tc("address")}
              </dt>
              <dd className="text-heading">
                {doctor.clinicName}
                <div className="text-xs text-muted">{doctor.address}</div>
              </dd>
              {apt.reason && (
                <>
                  <dt className="text-muted inline-flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4" /> {t("reason")}
                  </dt>
                  <dd className="text-heading">{apt.reason}</dd>
                </>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={`tel:${doctor.phone.replace(/\s/g, "")}`} variant="secondary" size="sm" icon={<Phone className="h-4 w-4" />}>
                {tc("call")}
              </Button>
              <Button href={chatHrefFor("patient", doctor.id)} variant="secondary" size="sm" icon={<MessageCircle className="h-4 w-4" />}>
                {t("chatWithDoctor")}
              </Button>
              {apt.status === "completed" && !apt.reviewId && (
                <Button href={`/patient/review/${apt.id}`} variant="accent" size="sm" icon={<Star className="h-4 w-4" />}>
                  {t("leaveReview")}
                </Button>
              )}
            </div>
          </Card>

          <section>
            <SectionTitle>{t("summary")}</SectionTitle>
            {apt.summary ? (
              <Card className="border-accent/40">
                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-white">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  {name} · {fmtDate(locale, tc, apt.summary.createdAt)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t("diagnosis")}</div>
                <p className="font-semibold text-heading mt-0.5">{apt.summary.diagnosis}</p>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted mt-3">{t("recommendations")}</div>
                <p className="text-heading mt-0.5 leading-relaxed">{apt.summary.recommendations}</p>
                <Link href="/patient/records" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <FolderHeart className="h-4 w-4" /> {t("addedToRecords")}
                </Link>
              </Card>
            ) : (
              <EmptyState compact icon={<Stethoscope className="h-7 w-7" />} title={t("noSummary")} description={t("noSummaryDesc")} />
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 self-start">
          <Card>
            <h3 className="font-bold text-heading mb-2 inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {doctor.clinicName}
            </h3>
            <MapView pins={[{ id: doctor.id, lat: doctor.lat, lng: doctor.lng, title: doctor.clinicName, subtitle: doctor.address }]} zoom={14} className="h-48" />
            <a
              href={`https://www.openstreetmap.org/directions?to=${doctor.lat}%2C${doctor.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-primary font-medium hover:underline"
            >
              {t("showRoute")} →
            </a>
          </Card>
        </aside>
      </div>
    </>
  );
}
