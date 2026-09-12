"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, Clock, Info, MapPin, Star } from "lucide-react";
import type { Appointment, DoctorProfile } from "@projectx/types";
import { cn, hoursUntil } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Modal } from "@projectx/ui/Modal";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";

const CANCEL_LIMIT_HOURS = 2;

export function AppointmentCard({
  appointment,
  doctor,
  onCancelled,
}: {
  appointment: Appointment;
  doctor: DoctorProfile;
  onCancelled?: (id: string) => void;
}) {
  const t = useTranslations("patient.appointments");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [cancelOpen, setCancelOpen] = useState(false);
  const name = `${doctor.firstName} ${doctor.lastName}`;
  const upcoming = appointment.status === "scheduled";
  const hours = hoursUntil(appointment.date, appointment.time);
  const locked = upcoming && hours < CANCEL_LIMIT_HOURS;
  const detailHref = `/patient/appointments/${appointment.id}`;

  return (
    <article className="bg-card rounded-xl shadow-card border border-line/60 p-4 flex flex-col gap-3">
      <div className="flex gap-3">
        <Link href={`/patient/doctors/${doctor.id}`}>
          <Avatar src={doctor.avatarUrl} name={name} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={detailHref} className="font-bold text-heading hover:text-primary block truncate">
                {name}
              </Link>
              <div className="text-sm text-primary">{useTranslationsSpecialty(doctor.specialty)}</div>
            </div>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-heading">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-muted" />
              <span className="capitalize">{fmtDate(locale, tc, appointment.date, "weekday")}</span>
              <span className="font-semibold">· {appointment.time}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted min-w-0">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{doctor.clinicName}</span>
            </span>
          </div>
        </div>
      </div>

      {upcoming && locked && (
        <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-amber-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{t("cancelDisabledHint")}</span>
        </div>
      )}

      <div className={cn("flex flex-wrap gap-2", "border-t border-line pt-3")}>
        {upcoming ? (
          <>
            <Button href={`/patient/doctors/${doctor.id}/book?reschedule=${appointment.id}`} variant="secondary" size="sm" disabled={locked} icon={<Clock className="h-4 w-4" />}>
              {t("reschedule")}
            </Button>
            <Button variant="ghost" size="sm" disabled={locked} onClick={() => setCancelOpen(true)} className="text-danger hover:bg-danger-soft">
              {t("cancel")}
            </Button>
            <Button href={detailHref} variant="ghost" size="sm" className="ml-auto">
              {tc("details")}
            </Button>
          </>
        ) : appointment.status === "completed" ? (
          <>
            {appointment.reviewId ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-success font-medium min-h-[36px]">
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
        <p className="text-[15px] text-heading">
          {t("cancelDesc", { doctor: name, date: fmtDate(locale, tc, appointment.date, "weekday"), time: appointment.time })}
        </p>
      </Modal>
    </article>
  );
}

function useTranslationsSpecialty(key: DoctorProfile["specialty"]) {
  const t = useTranslations("specialties");
  return t(key);
}
