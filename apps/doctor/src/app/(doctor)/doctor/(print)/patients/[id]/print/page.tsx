import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@projectx/mock/doctors";
import { getDoctorPatients } from "@projectx/mock/patients";
import { getSharedPatientRecords } from "@projectx/mock/records";
import { today } from "@projectx/utils/dates";
import { RecordPrintView } from "@projectx/ui/records/RecordPrintView";
import { parsePrintOptions, selectForPrint } from "@projectx/ui/records/groupRecords";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const findPatient = (id: string) => getDoctorPatients(currentDoctor.id).find((p) => p.user.id === id)?.user;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("records");
  const patient = findPatient((await params).id);
  return { title: patient ? `${t("title")} — ${patient.lastName} ${patient.firstName}` : t("title") };
}

/** Print sheet of a patient's record as the doctor sees it: always the doctor's view, never private entries. No app shell. */
export default async function PatientPrintPage({ params, searchParams }: Props) {
  const { id } = await params;
  const patient = findPatient(id);
  if (!patient) notFound();
  const options = { ...parsePrintOptions(await searchParams), mode: "doctor" as const };
  const printedOn = today();
  const { cover, entries } = selectForPrint(getSharedPatientRecords(patient.id), options, printedOn);
  return <RecordPrintView patient={patient} cover={cover} entries={entries} options={options} printedOn={printedOn} backHref={`/doctor/patients/${patient.id}`} />;
}
