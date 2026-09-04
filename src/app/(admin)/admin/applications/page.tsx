import { getTranslations } from "next-intl/server";
import { doctors } from "@/lib/mock/doctors";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApplicationsList } from "@/components/admin/ApplicationsList";

export default async function AdminApplicationsPage() {
  const t = await getTranslations("admin.applications");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ApplicationsList pending={doctors.filter((d) => d.status === "pending")} rejected={doctors.filter((d) => d.status === "rejected")} />
    </>
  );
}
