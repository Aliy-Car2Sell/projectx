import { getTranslations } from "next-intl/server";
import type { SpecialtyKey } from "@projectx/types";
import { approvedDoctors, specialtyKeys } from "@projectx/mock/doctors";
import { PageHeader } from "@projectx/ui/PageHeader";
import { readDemoState } from "@projectx/ui/demo/state";
import { DoctorSearch } from "@/components/doctors/DoctorSearch";

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("patient.doctors");
  const params = await searchParams;
  const state = readDemoState(params);
  // The landing page's search field and specialty chips arrive here as ?q= and ?specialty=.
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const specialty = specialtyKeys.find((k) => k === params.specialty) as SpecialtyKey | undefined;
  return (
    <>
      <PageHeader title={t("title")} />
      <DoctorSearch key={`${q}|${specialty ?? ""}`} doctors={approvedDoctors} state={state} initial={{ q, specialty }} />
    </>
  );
}
