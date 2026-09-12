import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@projectx/mock/doctors";
import { getDoctorAppointments } from "@projectx/mock/appointments";
import { users } from "@projectx/mock/users";
import { PageHeader } from "@projectx/ui/PageHeader";
import { DemoStates } from "@projectx/ui/demo/DemoStates";
import { readDemoState } from "@projectx/ui/demo/state";
import { DoctorAppointments } from "@/components/doctor/DoctorAppointments";

export default async function DoctorAppointmentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("doctor.appointments");
  const state = readDemoState(await searchParams);
  const patients = Object.fromEntries(users.map((u) => [u.id, u]));
  return (
    <>
      <PageHeader title={t("title")} />
      <DemoStates />
      <DoctorAppointments appointments={getDoctorAppointments(currentDoctor.id)} patients={patients} state={state} />
    </>
  );
}
