import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@/lib/mock/doctors";
import { getDoctorAppointments } from "@/lib/mock/appointments";
import { users } from "@/lib/mock/users";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemoStates } from "@/components/demo/DemoStates";
import { readDemoState } from "@/components/demo/state";
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
