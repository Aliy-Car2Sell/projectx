"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, Clock, MessageCircle } from "lucide-react";
import type { Appointment, User } from "@projectx/types";
import { chatHrefFor } from "@projectx/mock/chats";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Modal } from "@projectx/ui/Modal";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { minutesOf, timeOf } from "./calendar";

/** The appointment behind a calendar block (bottom sheet on phones); the full page is one tap away. */
export function AppointmentSheet({ appointment: a, patient, onClose }: { appointment: Appointment | null; patient?: User; onClose: () => void }) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const locale = useLocale();
  const name = patient ? `${patient.firstName} ${patient.lastName}` : (a?.patientId ?? "");

  return (
    <Modal
      open={a !== null}
      onClose={onClose}
      title={t("detail")}
      closeLabel={tc("close")}
      footer={
        a && (
          <>
            {patient && (
              <Button href={chatHrefFor("doctor", patient.id)} variant="secondary" icon={<MessageCircle className="h-4 w-4" />}>
                {t("chatWithPatient")}
              </Button>
            )}
            <Button href={`/doctor/appointments/${a.id}`} icon={<ArrowRight className="h-4 w-4" />}>
              {t("cal.open")}
            </Button>
          </>
        )
      }
    >
      {a && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={patient?.avatarUrl} name={name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold leading-tight text-heading">{name}</div>
              {patient && <div className="text-sm text-muted">{patient.phone}</div>}
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <AppointmentStatusBadge status={a.status} />
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="inline-flex items-center gap-1 text-xs text-muted">
                <CalendarDays className="h-3.5 w-3.5" /> {tc("date")}
              </dt>
              <dd className="font-semibold text-heading first-letter:uppercase">{fmtDate(locale, tc, a.date, "weekday")}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" /> {tc("time")}
              </dt>
              <dd className="font-semibold tabular-nums text-heading">
                {a.time}–{timeOf(minutesOf(a.time) + a.durationMin)} · {tc("min", { count: a.durationMin })}
              </dd>
            </div>
          </dl>
          <div>
            <div className="text-xs text-muted">{t("reason")}</div>
            <p className="text-heading">{a.reason ?? t("noReason")}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
