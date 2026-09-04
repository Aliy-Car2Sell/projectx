import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAppointmentById } from "@/lib/mock/appointments";
import { getDoctorById } from "@/lib/mock/doctors";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <ReviewForm appointment={apt} doctor={doctor} />
    </>
  );
}
