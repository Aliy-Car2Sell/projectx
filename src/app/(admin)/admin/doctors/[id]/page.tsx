import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarDays, ExternalLink, FileText, MapPin, Phone, Star } from "lucide-react";
import { getDoctorById } from "@projectx/mock/doctors";
import { getDoctorAppointments } from "@projectx/mock/appointments";
import { formatMoney } from "@projectx/utils";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card, CardHeader, StatCard } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader } from "@projectx/ui/PageHeader";
import { StarRating } from "@projectx/ui/StarRating";
import { MapView } from "@projectx/ui/map/MapView";
import { AdminDoctorStatus } from "@/components/admin/AdminDoctorStatus";
import { DocumentList } from "@projectx/ui/documents/DocumentList";

/** Admin view of a doctor: read-only profile, documents and block/unblock actions. */
export default async function AdminDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDoctorById(id);
  if (!d) notFound();

  const t = await getTranslations("admin.doctors");
  const ta = await getTranslations("admin.applications");
  const tc = await getTranslations("common");
  const ts = await getTranslations("specialties");
  const tcat = await getTranslations("categories");
  const tcity = await getTranslations("cities");
  const name = `${d.firstName} ${d.lastName}`;
  const appointmentsCount = getDoctorAppointments(d.id).length;

  return (
    <>
      <PageHeader
        title={t("detailTitle")}
        backHref="/admin/doctors"
        backLabel={t("backToList")}
        actions={
          d.status === "approved" ? (
            <Button href={`/patient/doctors/${d.id}?from=admin`} variant="secondary" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
              {t("publicProfile")}
            </Button>
          ) : undefined
        }
      />

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
                <div className="mt-2">
                  <StarRating value={d.rating} showValue count={d.reviewCount} countLabel={tc("reviews", { count: d.reviewCount })} size="sm" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-heading leading-relaxed">{d.about}</p>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("stats")} value={appointmentsCount} hint={t("appointmentsCount", { count: appointmentsCount })} icon={<CalendarDays className="h-5 w-5" />} tone="white" />
            <StatCard label={t("rating")} value={d.rating.toFixed(1)} hint={t("reviewsCount", { count: d.reviewCount })} icon={<Star className="h-5 w-5" />} tone="white" />
          </div>

          <Card>
            <CardHeader title={t("contact")} action={<MapPin className="h-5 w-5 text-primary" />} />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{ta("clinic")}</dt>
                <dd className="font-semibold text-heading">{d.clinicName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{ta("address")}</dt>
                <dd className="text-heading">{d.address}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{ta("phone")}</dt>
                <dd className="text-heading inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-muted" /> {d.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">{ta("price")}</dt>
                <dd className="text-heading">{d.price ? tc("sum", { value: formatMoney(d.price) }) : "—"}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <MapView pins={[{ id: d.id, lat: d.lat, lng: d.lng, title: d.clinicName, subtitle: d.address }]} zoom={13} className="h-48" />
            </div>
          </Card>

          <Card>
            <CardHeader title={t("documents")} />
            {d.documents.length === 0 ? (
              <EmptyState compact icon={<FileText className="h-7 w-7" />} title={ta("noDocs")} />
            ) : (
              <DocumentList documents={d.documents} columns={2} />
            )}
          </Card>
        </div>

        <aside className="self-start">
          <AdminDoctorStatus doctor={{ id: d.id, name, status: d.status }} />
        </aside>
      </div>
    </>
  );
}
