import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDoctorById } from "@projectx/mock/doctors";
import { generateSlots } from "@projectx/mock/appointments";
import { PageHeader } from "@projectx/ui/PageHeader";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reschedule?: string }>;
}) {
  const { id } = await params;
  const { reschedule } = await searchParams;
  const doctor = getDoctorById(id);
  if (!doctor) notFound();
  const t = await getTranslations("patient");
  const tc = await getTranslations("common");
  const slots = generateSlots(doctor.id, 14, doctor.slotDurationMin);

  return (
    <>
      <PageHeader
        title={reschedule ? t("appointments.rescheduleTitle") : t("book.title")}
        subtitle={reschedule ? t("appointments.rescheduleDesc") : undefined}
        backHref={`/patient/doctors/${doctor.id}`}
        backLabel={tc("back")}
      />
      <BookingFlow doctor={doctor} slots={slots} rescheduleId={reschedule} />
    </>
  );
}
