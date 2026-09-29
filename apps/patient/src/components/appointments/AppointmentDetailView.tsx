"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, ClipboardList, FolderHeart, MapPin, MessageCircle, Phone, Star, Stethoscope, Wallet } from "lucide-react";
import type { Appointment } from "@projectx/types";
import { getDoctorById } from "@projectx/mock/doctors";
import { chatHrefFor } from "@projectx/mock/chats";
import { formatMoney, toIsoDate } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { Skeleton } from "@projectx/ui/Skeleton";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { Toast, useToast } from "@projectx/ui/Toast";
import { MapView } from "@projectx/ui/map/MapView";
import { PaymentBadge } from "@projectx/ui/payment/PaymentBadge";
import { PaymentSheet } from "@projectx/ui/payment/PaymentSheet";
import { providerName } from "@projectx/ui/payment/ProviderMark";
import { useLocalAppointments } from "@projectx/ui/session/useLocalAppointments";
import { SummarySections } from "@projectx/ui/summary/SummarySections";

const noop = () => () => {};

/**
 * One appointment of the patient. `appointments` holds the mock one when the id is a mock id;
 * an appointment booked in this browser is looked up in the local store once the page has hydrated.
 */
export function AppointmentDetailView({ id, patientId, appointments }: { id: string; patientId: string; appointments: Appointment[] }) {
  const t = useTranslations("patient.appointments");
  const tc = useTranslations("common");
  const ts = useTranslations("specialties");
  const tp = useTranslations("payment");
  const locale = useLocale();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const { merged, save } = useLocalAppointments(patientId, appointments);
  const [payOpen, setPayOpen] = useState(false);
  const { toast, show } = useToast();
  const apt = merged.find((a) => a.id === id);
  const doctor = apt ? getDoctorById(apt.doctorId) : undefined;

  if (!apt || !doctor) {
    return (
      <>
        <PageHeader title={t("details")} backHref="/patient/appointments" backLabel={tc("back")} />
        {hydrated ? (
          <EmptyState illustration="appointments" title={t("notFound")} description={t("notFoundDesc")} action={<Button href="/patient/appointments">{t("title")}</Button>} />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
      </>
    );
  }
  const name = `${doctor.firstName} ${doctor.lastName}`;

  return (
    <>
      <PageHeader title={t("details")} backHref="/patient/appointments" backLabel={tc("back")} actions={<AppointmentStatusBadge status={apt.status} />} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <Link href={`/patient/doctors/${doctor.id}`} className="shrink-0 rounded-lg">
                <Avatar src={doctor.avatarUrl} name={name} size="photo" shape="square" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/patient/doctors/${doctor.id}`} className="block font-display text-h3 text-heading [overflow-wrap:anywhere] hover:text-primary-700">
                  {name}
                </Link>
                <div className="text-sm text-primary-text">{ts(doctor.specialty)}</div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-t border-line pt-5 text-sm">
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
              {apt.payment && (
                <>
                  <dt className="text-muted inline-flex items-center gap-1.5">
                    <Wallet className="h-4 w-4" /> {tp("label")}
                  </dt>
                  <dd className="text-heading">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span className="font-semibold tabular-nums">{tc("sum", { value: formatMoney(apt.payment.amount) })}</span>
                      <PaymentBadge payment={apt.payment} />
                    </span>
                    {apt.payment.status === "paid" && apt.payment.paidAt && (
                      <div className="text-xs text-muted">
                        {[apt.payment.method && tp("method", { provider: providerName[apt.payment.method] }), fmtDate(locale, tc, toIsoDate(new Date(apt.payment.paidAt)), "medium")].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </dd>
                </>
              )}
              {apt.reason && (
                <>
                  <dt className="text-muted inline-flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4" /> {t("reason")}
                  </dt>
                  <dd className="text-heading">{apt.reason}</dd>
                </>
              )}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {apt.status === "scheduled" && apt.payment?.status === "unpaid" && (
                <Button size="sm" onClick={() => setPayOpen(true)} icon={<Wallet className="h-4 w-4" />}>
                  {tp("pay")}
                </Button>
              )}
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
              <Card accent="primary">
                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-pill gradient-accent text-white">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  {name} · {fmtDate(locale, tc, apt.summary.createdAt)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t("diagnosis")}</div>
                <p className="font-semibold text-heading mt-0.5">{apt.summary.diagnosis}</p>
                {apt.summary.sections?.length ? (
                  <SummarySections sections={apt.summary.sections.filter((s) => s.body !== apt.summary?.diagnosis)} className="mt-3" />
                ) : (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted mt-3">{t("recommendations")}</div>
                    <p className="text-heading mt-0.5 leading-relaxed">{apt.summary.recommendations}</p>
                  </>
                )}
                <Link href="/patient/records" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-text hover:underline">
                  <FolderHeart className="h-4 w-4" /> {t("addedToRecords")}
                </Link>
              </Card>
            ) : (
              <EmptyState compact illustration="records" title={t("noSummary")} description={t("noSummaryDesc")} />
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <Card>
            <h3 className="font-bold text-heading mb-2 inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-text" /> {doctor.clinicName}
            </h3>
            <MapView pins={[{ id: doctor.id, lat: doctor.lat, lng: doctor.lng, title: doctor.clinicName, subtitle: doctor.address }]} zoom={14} className="h-48" />
            <a
              href={`https://www.openstreetmap.org/directions?to=${doctor.lat}%2C${doctor.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-primary-text font-medium hover:underline"
            >
              {t("showRoute")} →
            </a>
          </Card>
        </aside>
      </div>

      {apt.payment && (
        <PaymentSheet
          open={payOpen}
          amount={apt.payment.amount}
          onClose={() => setPayOpen(false)}
          onPaid={(payment) => {
            setPayOpen(false);
            save({ ...apt, payment });
            show(tp("paidToast"));
          }}
        />
      )}
      <Toast message={toast} />
    </>
  );
}
