import { getTranslations } from "next-intl/server";
import { currentPatient } from "@projectx/mock/users";
import { doctors } from "@projectx/mock/doctors";
import { getPatientAppointments } from "@projectx/mock/appointments";
import { PageHeader } from "@projectx/ui/PageHeader";
import { DemoStates } from "@projectx/ui/demo/DemoStates";
import { readDemoState } from "@projectx/ui/demo/state";
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
