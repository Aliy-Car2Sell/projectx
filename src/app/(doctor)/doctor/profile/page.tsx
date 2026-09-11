import { getTranslations } from "next-intl/server";
import { ExternalLink, FileText, MapPin } from "lucide-react";
import { currentDoctor, cityKeys, specialtyKeys } from "@/lib/mock/doctors";
import { currentDoctorUser } from "@/lib/mock/users";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { DoctorStatusBadge } from "@/components/ui/StatusBadge";
import { MapView } from "@/components/map/MapView";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function DoctorProfilePage() {
  const t = await getTranslations("doctor.profile");
  const tc = await getTranslations("common");
  const ts = await getTranslations("specialties");
  const tcat = await getTranslations("categories");
  const tcity = await getTranslations("cities");
  const d = currentDoctor;

  const professional = (
    <>
      <Card>
        <CardHeader
          title={t("professional")}
          action={
            <div className="flex items-center gap-2">
              <DoctorStatusBadge status={d.status} />
            </div>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label={t("specialty")} defaultValue={d.specialty} options={specialtyKeys.map((k) => ({ value: k, label: ts(k) }))} />
          <Select label={t("category")} defaultValue={d.category} options={(["highest", "first", "second", "none"] as const).map((k) => ({ value: k, label: tcat(k) }))} />
          <Input label={t("experience")} type="number" defaultValue={d.experienceYears} />
          <Input label={t("slotDuration")} type="number" defaultValue={d.slotDurationMin} />
          <Input label={t("clinic")} defaultValue={d.clinicName} />
          <Select label={tc("city")} defaultValue={d.city} options={cityKeys.map((k) => ({ value: k, label: tcity(k) }))} />
          <div className="sm:col-span-2">
            <Input label={t("address")} defaultValue={d.address} />
          </div>
          <Input label={t("price")} type="number" defaultValue={d.price} />
          <div className="sm:col-span-2">
            <Textarea label={t("about")} defaultValue={d.about} rows={4} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button href={`/patient/doctors/${d.id}?from=doctor`} variant="ghost" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
            {t("viewPublic")}
          </Button>
          <Button>{tc("save")}</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title={t("location")} action={<MapPin className="h-5 w-5 text-primary" />} />
        <MapView pins={[{ id: d.id, lat: d.lat, lng: d.lng, title: d.clinicName }]} zoom={14} className="h-48" />
      </Card>

      <Card>
        <CardHeader title={t("documents")} />
        <ul className="divide-y divide-line">
          {d.documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-heading truncate">{doc.fileName}</div>
                <div className="text-xs text-muted uppercase">{doc.type}</div>
              </div>
              <Button variant="ghost" size="sm">{tc("view")}</Button>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );

  return (
    <>
      <PageHeader title={t("title")} />
      <ProfileForm user={currentDoctorUser} extra={professional} />
    </>
  );
}
