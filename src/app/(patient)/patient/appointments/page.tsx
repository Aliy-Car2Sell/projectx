import { getTranslations } from "next-intl/server";
import { currentPatient } from "@/lib/mock/users";
import { doctors } from "@/lib/mock/doctors";
import { getPatientAppointments } from "@/lib/mock/appointments";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemoStates } from "@/components/demo/DemoStates";
import { readDemoState } from "@/components/demo/state";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("patient.appointments");
  const state = readDemoState(await searchParams);
  const map = Object.fromEntries(doctors.map((d) => [d.id, d]));
  return (
    <>
      <PageHeader title={t("title")} />
      <DemoStates />
      <AppointmentsList appointments={getPatientAppointments(currentPatient.id)} doctors={map} state={state} />
    </>
  );
}
