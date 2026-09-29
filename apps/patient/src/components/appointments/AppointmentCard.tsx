"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, Clock, Info, MapPin, Star, Wallet } from "lucide-react";
import type { Appointment, AppointmentPayment, DoctorProfile } from "@projectx/types";
import { hoursUntil } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Tooltip } from "@projectx/ui/Tooltip";
import { Modal } from "@projectx/ui/Modal";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { PaymentBadge } from "@projectx/ui/payment/PaymentBadge";
import { PaymentSheet } from "@projectx/ui/payment/PaymentSheet";

const CANCEL_LIMIT_HOURS = 2;

export function AppointmentCard({
  appointment,
  doctor,
  onCancelled,
  onPaid,
}: {
  appointment: Appointment;
  doctor: DoctorProfile;
  onCancelled?: (id: string) => void;
  /** Enables "pay" on an upcoming appointment that is not paid yet. */
  onPaid?: (payment: AppointmentPayment) => void;
}) {
  const t = useTranslations("patient.appointments");
  const tc = useTranslations("common");
  const th = useTranslations("hints");
  const tp = useTranslations("payment");
  const locale = useLocale();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const { payment } = appointment;
  const name = `${doctor.firstName} ${doctor.lastName}`;
  const upcoming = appointment.status === "scheduled";
  const hours = hoursUntil(appointment.date, appointment.time);
  const locked = upcoming && hours < CANCEL_LIMIT_HOURS;
  const detailHref = `/patient/appointments/${appointment.id}`;

  return (
    <article className="bg-card rounded-lg shadow-sm border border-neutral-200/70 p-4 md:p-5 flex flex-col gap-3.5">
      <div className="flex gap-3">
        <Link href={`/patient/doctors/${doctor.id}`}>
          <Avatar src={doctor.avatarUrl} name={name} size="lg" shape="square" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={detailHref} className="block font-display text-lg font-bold leading-tight text-heading [overflow-wrap:anywhere] hover:text-primary-700">
                {name}
              </Link>
              <div className="mt-0.5 text-sm font-medium text-primary-700">{useTranslationsSpecialty(doctor.specialty)}</div>
            </div>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <AppointmentStatusBadge status={appointment.status} />
              <PaymentBadge payment={payment} />
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-heading">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-muted" />
              <span className="capitalize">{fmtDate(locale, tc, appointment.date, "weekday")}</span>
              <span className="font-semibold">· {appointment.time}</span>
              {upcoming && <Tooltip label={th("label")} text={th("twoHours")} />}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted min-w-0">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{doctor.clinicName}</span>
            </span>
          </div>
        </div>
      </div>

      {upcoming && locked && (
        <div className="flex items-start gap-2 rounded-md bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{t("cancelDisabledHint")}</span>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3.5">
        {upcoming ? (
          <>
            {payment?.status === "unpaid" && onPaid && (
              <Button size="sm" onClick={() => setPayOpen(true)} icon={<Wallet className="h-4 w-4" />}>
                {tp("pay")}
              </Button>
            )}
            <Button href={`/patient/doctors/${doctor.id}/book?reschedule=${appointment.id}`} variant="secondary" size="sm" disabled={locked} icon={<Clock className="h-4 w-4" />}>
              {t("reschedule")}
            </Button>
            <Button variant="ghost" size="sm" disabled={locked} onClick={() => setCancelOpen(true)} className="text-danger-700 hover:bg-danger-50">
              {t("cancel")}
            </Button>
            <Button href={detailHref} variant="ghost" size="sm" className="ml-auto">
              {tc("details")}
            </Button>
          </>
        ) : appointment.status === "completed" ? (
          <>
            {appointment.reviewId ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-success-700 font-medium min-h-[36px]">
                <Star className="h-4 w-4" fill="currentColor" /> {t("reviewLeft")}
              </span>
            ) : (
              <Button href={`/patient/review/${appointment.id}`} variant="accent" size="sm" icon={<Star className="h-4 w-4" />}>
                {t("leaveReview")}
              </Button>
            )}
            <Button href={detailHref} variant="ghost" size="sm" className="ml-auto">
              {appointment.summary ? t("summary") : tc("details")}
            </Button>
          </>
        ) : (
          <Button href={detailHref} variant="ghost" size="sm" className="ml-auto">
            {tc("details")}
          </Button>
        )}
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t("cancelTitle")}
        closeLabel={tc("close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              {t("keep")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setCancelOpen(false);
                onCancelled?.(appointment.id);
              }}
            >
              {t("cancelConfirm")}
            </Button>
          </>
        }
      >
        <p className="text-base text-muted">
          {t("cancelDesc", { doctor: name, date: fmtDate(locale, tc, appointment.date, "weekday"), time: appointment.time })}
        </p>
      </Modal>
      {payment && onPaid && (
        <PaymentSheet
          open={payOpen}
          amount={payment.amount}
          onClose={() => setPayOpen(false)}
          onPaid={(p) => {
            setPayOpen(false);
            onPaid(p);
          }}
        />
      )}
    </article>
  );
}

function useTranslationsSpecialty(key: DoctorProfile["specialty"]) {
  const t = useTranslations("specialties");
  return t(key);
}
