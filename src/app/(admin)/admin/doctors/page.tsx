import { getTranslations } from "next-intl/server";
import { doctors } from "@/lib/mock/doctors";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminDoctors } from "@/components/admin/AdminDoctors";

export default async function AdminDoctorsPage() {
  const t = await getTranslations("admin.doctors");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminDoctors doctors={doctors.filter((d) => d.status === "approved" || d.status === "blocked")} />
    </>
  );
}
