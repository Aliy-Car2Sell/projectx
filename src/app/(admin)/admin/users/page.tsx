import { getTranslations } from "next-intl/server";
import { users } from "@projectx/mock/users";
import { PageHeader } from "@projectx/ui/PageHeader";
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
