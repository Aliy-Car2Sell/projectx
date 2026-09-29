import { notFound } from "next/navigation";
import { getAppointmentById } from "@projectx/mock/appointments";
import { currentPatient } from "@projectx/mock/users";
import { AppointmentDetailView } from "@/components/appointments/AppointmentDetailView";

/** Ids of appointments booked in the browser (BookingFlow); the server has never seen them. */
const LOCAL_ID = /^apt-local-\d+$/;

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apt = getAppointmentById(id);
  if (!apt && !LOCAL_ID.test(id)) notFound();
  return <AppointmentDetailView id={id} patientId={currentPatient.id} appointments={apt ? [apt] : []} />;
}
