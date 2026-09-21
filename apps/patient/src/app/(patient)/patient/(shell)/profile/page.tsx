import { getTranslations } from "next-intl/server";
import { currentPatient } from "@projectx/mock/users";
import { PageHeader } from "@projectx/ui/PageHeader";
import { ProfileForm } from "@projectx/ui/profile/ProfileForm";
import { signOut } from "@/lib/session-actions";

export default async function PatientProfilePage() {
  const t = await getTranslations("profile");
  return (
    <>
      <PageHeader title={t("title")} />
      <ProfileForm user={currentPatient} logoutAction={signOut} guideHref="/patient" />
    </>
  );
}
