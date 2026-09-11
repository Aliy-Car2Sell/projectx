import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarClock, ClipboardList, FolderHeart, MessageCircle, Phone } from "lucide-react";
import { getAppointmentById } from "@/lib/mock/appointments";
import { getUserById } from "@/lib/mock/users";
import { chatHrefFor } from "@/lib/mock/chats";
import { ageFromBirthDate } from "@/lib/mock/patients";
import { fmtDate } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { AppointmentSummaryPanel } from "@/components/doctor/AppointmentSummaryPanel";

export default async function DoctorAppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apt = getAppointmentById(id);
  const patient = apt ? getUserById(apt.patientId) : undefined;
  if (!apt || !patient) notFound();

  const t = await getTranslations("doctor.appointments");
  const tc = await getTranslations("common");
  const tcity = await getTranslations("cities");
  const locale = await getLocale();
  const name = `${patient.firstName} ${patient.lastName}`;
  const age = ageFromBirthDate(patient.birthDate);

  return (
    <>
      <PageHeader title={t("detail")} backHref="/doctor/appointments" backLabel={tc("back")} actions={<AppointmentStatusBadge status={apt.status} />} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar src={patient.avatarUrl} name={name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted">{t("patient")}</div>
                <Link href={`/doctor/patients/${patient.id}`} className="font-bold text-heading text-lg hover:text-primary block truncate">
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

          {apt.status === "scheduled" && (
            <Card padding="sm" className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">{t("markCompleted")}</Button>
              <Button variant="ghost" size="sm" className="text-danger">{t("markNoShow")}</Button>
              <Badge tone="primary" className="ml-auto self-center">{tc("today")}</Badge>
            </Card>
          )}
        </div>

        <section>
          <SectionTitle>{t("summaryTitle")}</SectionTitle>
          <AppointmentSummaryPanel appointment={apt} />
        </section>
      </div>
    </>
  );
}
