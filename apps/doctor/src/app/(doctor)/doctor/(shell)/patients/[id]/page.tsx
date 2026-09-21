import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Info, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { currentDoctor } from "@projectx/mock/doctors";
import { getDoctorPatients, ageFromBirthDate } from "@projectx/mock/patients";
import { getSharedPatientRecords } from "@projectx/mock/records";
import { chatHrefFor } from "@projectx/mock/chats";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { AppointmentStatusBadge } from "@projectx/ui/StatusBadge";
import { PatientRecordsPanel } from "@/components/doctor/PatientRecordsPanel";

export default async function DoctorPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getDoctorPatients(currentDoctor.id).find((p) => p.user.id === id);
  if (!entry) notFound();
  const { user, appointments, hasActive } = entry;

  const t = await getTranslations("doctor.patients");
  const tc = await getTranslations("common");
  const tcity = await getTranslations("cities");
  const locale = await getLocale();
  const name = `${user.firstName} ${user.lastName}`;
  const age = ageFromBirthDate(user.birthDate);

  return (
    <>
      <PageHeader title={t("patientCard")} backHref="/doctor/patients" backLabel={tc("back")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={name} size="lg" />
              <div className="min-w-0">
                <div className="font-bold text-heading text-lg leading-tight">{name}</div>
                <div className="text-sm text-muted">
                  {age !== undefined && t("age", { count: age })}
                  {user.birthDate && <div className="text-xs">{t("born", { date: fmtDate(locale, tc, user.birthDate) })}</div>}
                </div>
                {hasActive && <Badge tone="success" dot className="mt-1">{t("activeBadge")}</Badge>}
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t("contact")}</div>
            <ul className="mt-1 text-sm text-heading flex flex-col gap-1">
              <li className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted" /> {user.phone}
              </li>
              <li className="inline-flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 text-muted shrink-0" /> <span className="truncate">{user.email}</span>
              </li>
              {user.city && (
                <li className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted" /> {tcity(user.city)}
                </li>
              )}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button href={chatHrefFor("doctor", user.id)} variant="secondary" size="sm" icon={<MessageCircle className="h-4 w-4" />}>
                {tc("messages")}
              </Button>
              <Button href={`tel:${user.phone.replace(/\s/g, "")}`} variant="ghost" size="sm" icon={<Phone className="h-4 w-4" />}>
                {tc("call")}
              </Button>
            </div>
          </Card>

          <Card padding="sm">
            <SectionTitle className="mb-1">{t("appointmentsHistory")}</SectionTitle>
            <ul className="divide-y divide-line">
              {[...appointments].reverse().map((a) => (
                <li key={a.id}>
                  <Link href={`/doctor/appointments/${a.id}`} className="flex items-center justify-between gap-2 py-2 text-sm hover:text-primary">
                    <span>
                      {fmtDate(locale, tc, a.date, "short")} · {a.time}
                    </span>
                    <AppointmentStatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex items-start gap-2 text-xs text-muted">
            <Info className="h-4 w-4 shrink-0" />
            <span>{t("accessNote")}</span>
          </div>
        </aside>

        <div>
          <PatientRecordsPanel patient={user} records={getSharedPatientRecords(user.id)} doctorName={`${currentDoctor.firstName} ${currentDoctor.lastName}`} />
        </div>
      </div>
    </>
  );
}
