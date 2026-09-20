import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAppointmentById } from "@projectx/mock/appointments";
import { getDoctorById } from "@projectx/mock/doctors";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@projectx/ui/Button";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader } from "@projectx/ui/PageHeader";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export default async function ReviewPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const apt = getAppointmentById(appointmentId);
  const doctor = apt ? getDoctorById(apt.doctorId) : undefined;
  if (!apt || !doctor) notFound();
  const t = await getTranslations("patient.review");
  const tc = await getTranslations("common");
  return (
    <>
      <PageHeader title={t("title")} backHref="/patient/appointments" backLabel={tc("back")} />
      {apt.reviewId ? (
        <EmptyState
          icon={<CheckCircle2 className="h-7 w-7" />}
          title={t("alreadyTitle")}
          description={t("alreadyDesc")}
          action={<Button href="/patient/appointments">{t("backToAppointments")}</Button>}
        />
      ) : (
        <ReviewForm appointment={apt} doctor={doctor} />
      )}
    </>
  );
}
