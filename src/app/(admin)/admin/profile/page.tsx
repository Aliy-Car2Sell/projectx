import { getTranslations } from "next-intl/server";
import { currentAdmin } from "@projectx/mock/users";
import { PageHeader } from "@projectx/ui/PageHeader";
import { ProfileForm } from "@projectx/ui/profile/ProfileForm";

export default async function AdminProfilePage() {
  const t = await getTranslations("admin.profile");
  return (
    <>
      <PageHeader title={t("title")} />
      <ProfileForm user={currentAdmin} />
    </>
  );
}
