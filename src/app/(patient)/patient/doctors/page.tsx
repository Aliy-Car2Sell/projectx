import { getTranslations } from "next-intl/server";
import { approvedDoctors } from "@projectx/mock/doctors";
import { PageHeader } from "@projectx/ui/PageHeader";
import { DemoStates } from "@projectx/ui/demo/DemoStates";
import { readDemoState } from "@projectx/ui/demo/state";
import { DoctorSearch } from "@/components/doctors/DoctorSearch";

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("patient.doctors");
  const state = readDemoState(await searchParams);
  return (
    <>
      <PageHeader title={t("title")} />
      <DemoStates />
      <DoctorSearch doctors={approvedDoctors} state={state} />
    </>
  );
}
