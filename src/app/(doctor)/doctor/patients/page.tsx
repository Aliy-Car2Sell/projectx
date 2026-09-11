import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@/lib/mock/doctors";
import { getDoctorPatients } from "@/lib/mock/patients";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemoStates } from "@/components/demo/DemoStates";
import { readDemoState } from "@/components/demo/state";
import { PatientsList } from "@/components/doctor/PatientsList";

export default async function DoctorPatientsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("doctor.patients");
  const state = readDemoState(await searchParams);
  const patients = state === "empty" ? [] : getDoctorPatients(currentDoctor.id);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DemoStates />
      <PatientsList patients={patients} state={state} />
    </>
  );
}
