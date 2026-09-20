"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, ClipboardList, FolderHeart, MessageCircle, Phone } from "lucide-react";
import type { Appointment, AppointmentStatus, User } from "@projectx/types";
import { fmtDate } from "@projectx/utils/dates";
import { chatHrefFor } from "@projectx/mock/chats";
import { isToday } from "@projectx/utils";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { Toast, useToast } from "@projectx/ui/Toast";
import { AppointmentSummaryPanel } from "./AppointmentSummaryPanel";

/** Doctor's appointment page body; the status can be changed in the session (mock). */
export function AppointmentDetail({ appointment, patient, age }: { appointment: Appointment; patient: User; age?: number }) {
  const t = useTranslations("doctor.appointments");
  const tc = useTranslations("common");
  const tcity = useTranslations("cities");
  const locale = useLocale();
  const { toast, show } = useToast();
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const apt = { ...appointment, status };
  const name = `${patient.firstName} ${patient.lastName}`;

  const setAndNotify = (next: AppointmentStatus, message: string) => {
    setStatus(next);
    show(message);
  };

  return (
    <>
      <PageHeader title={t("detail")} backHref="/doctor/appointments" backLabel={tc("back")} actions={<AppointmentStatusBadge status={status} />} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar src={patient.avatarUrl} name={name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted">{t("patient")}</div>
                <Link href={`/doctor/patients/${patient.id}`} className="font-bold text-heading text-lg hover:text-primary-text block truncate">
                  {name}
                </Link>
                <div className="text-sm text-muted">
                  {age !== undefined && <>{t("age", { count: age })} · </>}
                  {patient.city && tcity(patient.city)}
                </div>
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
                <ClipboardList className="h-4 w-4" /> {t("reason")}
              </dt>
              <dd className="text-heading">{apt.reason ?? <span className="text-muted">{t("noReason")}</span>}</dd>
              <dt className="text-muted inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {tc("phone")}
              </dt>
              <dd className="text-heading">{patient.phone}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={`/doctor/patients/${patient.id}`} size="sm" icon={<FolderHeart className="h-4 w-4" />}>
                {t("viewRecords")}
              </Button>
              <Button href={chatHrefFor("doctor", patient.id)} variant="secondary" size="sm" icon={<MessageCircle className="h-4 w-4" />}>
                {t("chatWithPatient")}
              </Button>
              <Button href={`tel:${patient.phone.replace(/\s/g, "")}`} variant="ghost" size="sm" icon={<Phone className="h-4 w-4" />}>
                {t("callPatient")}
              </Button>
            </div>
          </Card>

          {status === "scheduled" && (
            <Card padding="sm" className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAndNotify("completed", t("markedCompleted"))}>
                {t("markCompleted")}
              </Button>
              <Button variant="ghost" size="sm" className="text-danger" onClick={() => setAndNotify("no_show", t("markedNoShow"))}>
                {t("markNoShow")}
              </Button>
              {isToday(apt.date) && (
                <Badge tone="primary" className="ml-auto self-center">
                  {tc("today")}
                </Badge>
              )}
            </Card>
          )}
        </div>

        <section>
          <SectionTitle>{t("summaryTitle")}</SectionTitle>
          <AppointmentSummaryPanel appointment={apt} />
        </section>
      </div>

      <Toast message={toast} />
    </>
  );
}
