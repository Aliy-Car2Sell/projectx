import { getTranslations } from "next-intl/server";
import { currentPatient } from "@/lib/mock/users";
import { getPatientRecords } from "@/lib/mock/records";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemoStates } from "@/components/demo/DemoStates";
import { readDemoState } from "@/components/demo/state";
import { RecordsView } from "@/components/records/RecordsView";

export default async function RecordsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("patient.records");
  const state = readDemoState(await searchParams);
  return (
    <>
      <PageHeader title={t("title")} />
      <DemoStates />
      <RecordsView records={getPatientRecords(currentPatient.id)} mode="patient" state={state} />
    </>
  );
}
