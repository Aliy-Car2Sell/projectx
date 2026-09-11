import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { FileText, MapPin, Phone } from "lucide-react";
import { getDoctorById } from "@/lib/mock/doctors";
import { fmtDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { MapView } from "@/components/map/MapView";
import { ApplicationDecision } from "@/components/admin/ApplicationDecision";
import { DocumentList } from "@/components/doctor/DocumentList";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDoctorById(id);
  if (!d) notFound();

  const t = await getTranslations("admin.applications");
  const tc = await getTranslations("common");
  const ts = await getTranslations("specialties");
  const tcat = await getTranslations("categories");
  const tcity = await getTranslations("cities");
  const locale = await getLocale();
  const name = `${d.firstName} ${d.lastName}`;

  return (
    <>
      <PageHeader title={t("detailTitle")} subtitle={d.appliedAt ? `${t("appliedAt")}: ${fmtDate(locale, tc, d.appliedAt)}` : undefined} backHref="/admin/applications" backLabel={t("backToList")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start gap-4">
              <Avatar src={d.avatarUrl} name={name} size="xl" />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-heading">{name}</h2>
                <div className="text-primary font-medium">{ts(d.specialty)}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="accent">{tcat(d.category)}</Badge>
                  <Badge tone="primary">{tcity(d.city)}</Badge>
                  <Badge tone="neutral">{tc("years", { count: d.experienceYears })}</Badge>
                </div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{t("clinic")}</dt>
                <dd className="font-semibold text-heading">{d.clinicName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{t("address")}</dt>
                <dd className="text-heading">{d.address}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{t("phone")}</dt>
                <dd className="text-heading inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-muted" /> {d.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{t("price")}</dt>
                <dd className="text-heading">{d.price ? tc("sum", { value: formatMoney(d.price) }) : "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted">{t("about")}</dt>
                <dd className="text-heading">{d.about}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title={t("uploadedDocs")} />
            {d.documents.length === 0 ? (
              <EmptyState compact icon={<FileText className="h-7 w-7" />} title={t("noDocs")} />
            ) : (
              <DocumentList documents={d.documents} columns={2} />
            )}
          </Card>

          <Card>
            <CardHeader title={t("address")} action={<MapPin className="h-5 w-5 text-primary" />} />
            <MapView pins={[{ id: d.id, lat: d.lat, lng: d.lng, title: d.clinicName, subtitle: d.address }]} zoom={13} className="h-48" />
          </Card>
        </div>

        <aside className="self-start">
          <ApplicationDecision initialStatus={d.status} />
        </aside>
      </div>
    </>
  );
}
