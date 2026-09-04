import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@/lib/mock/doctors";
import { getDoctorReviews, ratingDistribution } from "@/lib/mock/reviews";
import { PageHeader, SectionTitle } from "@/components/ui/PageHeader";
import { RatingSummary } from "@/components/doctor/RatingSummary";
import { DoctorReviewsList } from "@/components/doctor/DoctorReviewsList";

export default async function DoctorReviewsPage() {
  const t = await getTranslations("doctor.reviews");
  const reviews = getDoctorReviews(currentDoctor.id, true);
  return (
    <>
      <PageHeader title={t("title")} />
      <RatingSummary average={currentDoctor.rating} total={currentDoctor.reviewCount} distribution={ratingDistribution(currentDoctor.id)} />
      <SectionTitle className="mt-6">{t("latest")}</SectionTitle>
      <DoctorReviewsList reviews={reviews} />
    </>
  );
}
