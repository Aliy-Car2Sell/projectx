import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@projectx/mock/doctors";
import { getDoctorPatients } from "@projectx/mock/patients";
import { PageHeader } from "@projectx/ui/PageHeader";
import { readDemoState } from "@projectx/ui/demo/state";
import { PatientsList } from "@/components/doctor/PatientsList";

export default async function DoctorPatientsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("doctor.patients");
  const state = readDemoState(await searchParams);
  const patients = state === "empty" ? [] : getDoctorPatients(currentDoctor.id);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PatientsList patients={patients} state={state} />
    </>
  );
}
