import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";
import { currentDoctor } from "@/lib/mock/doctors";
import { currentDoctorUser } from "@/lib/mock/users";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { MapView } from "@/components/map/MapView";
import { DocumentList } from "@/components/doctor/DocumentList";
import { ProfessionalForm } from "@/components/doctor/ProfessionalForm";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function DoctorProfilePage() {
  const t = await getTranslations("doctor.profile");
  const d = currentDoctor;

  const professional = (
    <>
      <ProfessionalForm doctor={d} />

      <Card>
        <CardHeader title={t("location")} action={<MapPin className="h-5 w-5 text-primary" />} />
        <MapView pins={[{ id: d.id, lat: d.lat, lng: d.lng, title: d.clinicName }]} zoom={14} className="h-48" />
      </Card>

      <Card>
        <CardHeader title={t("documents")} />
        <DocumentList documents={d.documents} />
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
