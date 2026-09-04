import { getTranslations } from "next-intl/server";
import { users } from "@/lib/mock/users";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminUsers } from "@/components/admin/AdminUsers";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin.users");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminUsers users={users} />
    </>
  );
}
