import { getTranslations } from "next-intl/server";
import { currentAdmin } from "@/lib/mock/users";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function AdminProfilePage() {
  const t = await getTranslations("admin.profile");
  return (
    <>
      <PageHeader title={t("title")} />
      <ProfileForm user={currentAdmin} />
    </>
  );
}
