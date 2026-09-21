import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { currentPatient } from "@projectx/mock/users";
import { getPatientRecords } from "@projectx/mock/records";
import { today } from "@projectx/utils/dates";
import { RecordPrintView } from "@projectx/ui/records/RecordPrintView";
import { parsePrintOptions, selectForPrint } from "@projectx/ui/records/groupRecords";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("records");
  // The browser suggests the page title as the PDF file name.
  return { title: `${t("title")} — ${currentPatient.lastName} ${currentPatient.firstName}` };
}

/** Print sheet of the patient's own record: `?period=3m|1y|all&sections=a,b&mode=full|doctor&record=<id>&auto=1`. No app shell. */
export default async function RecordsPrintPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const options = parsePrintOptions(await searchParams);
  const printedOn = today();
  const { cover, entries } = selectForPrint(getPatientRecords(currentPatient.id), options, printedOn);
  return <RecordPrintView patient={currentPatient} cover={cover} entries={entries} options={options} printedOn={printedOn} backHref="/patient/records" />;
}
