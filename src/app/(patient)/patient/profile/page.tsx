import { getTranslations } from "next-intl/server";
import { currentPatient } from "@/lib/mock/users";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function PatientProfilePage() {
  const t = await getTranslations("patient.profile");
  return (
    <>
      <PageHeader title={t("title")} />
      <ProfileForm user={currentPatient} />
    </>
  );
}
