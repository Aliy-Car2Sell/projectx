import { getTranslations } from "next-intl/server";
import { currentPatient } from "@projectx/mock/users";
import { getPatientRecords } from "@projectx/mock/records";
import { getPatientDoctors } from "@projectx/mock/patients";
import { PageHeader } from "@projectx/ui/PageHeader";
import { readDemoState } from "@projectx/ui/demo/state";
import { RecordsView } from "@projectx/ui/records/RecordsView";

export default async function RecordsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("records");
  const state = readDemoState(await searchParams);
  return (
    <>
      <PageHeader title={t("title")} />
      <RecordsView
        patient={currentPatient}
        records={getPatientRecords(currentPatient.id)}
        role="patient"
        doctors={getPatientDoctors(currentPatient.id)}
        state={state}
        printHref="/patient/records/print"
      />
    </>
  );
}
