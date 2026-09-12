import { getTranslations } from "next-intl/server";
import { doctors } from "@projectx/mock/doctors";
import { reviews } from "@projectx/mock/reviews";
import { PageHeader } from "@projectx/ui/PageHeader";
import { AdminReviews } from "@/components/admin/AdminReviews";

export default async function AdminReviewsPage() {
  const t = await getTranslations("admin.reviews");
  const names = Object.fromEntries(doctors.map((d) => [d.id, `${d.firstName} ${d.lastName}`]));
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminReviews reviews={reviews} doctorNames={names} />
    </>
  );
}
