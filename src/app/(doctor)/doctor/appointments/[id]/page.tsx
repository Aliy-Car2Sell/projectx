import { notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/mock/appointments";
import { getUserById } from "@/lib/mock/users";
import { ageFromBirthDate } from "@/lib/mock/patients";
import { AppointmentDetail } from "@/components/doctor/AppointmentDetail";

export default async function DoctorAppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apt = getAppointmentById(id);
  const patient = apt ? getUserById(apt.patientId) : undefined;
  if (!apt || !patient) notFound();

  return <AppointmentDetail appointment={apt} patient={patient} age={ageFromBirthDate(patient.birthDate)} />;
}
