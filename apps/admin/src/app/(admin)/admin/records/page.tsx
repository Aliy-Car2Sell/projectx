import { getTranslations } from "next-intl/server";
import { getRecordsForReview } from "@projectx/mock/records";
import { getUserById } from "@projectx/mock/users";
import { PageHeader } from "@projectx/ui/PageHeader";
import { readDemoState } from "@projectx/ui/demo/state";
import { RecordsReviewList, type ReviewRow } from "@/components/admin/RecordsReviewList";

/** Patient uploads waiting for a check (plus the ones already approved / rejected). */
export default async function AdminRecordsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("admin.records");
  const state = readDemoState(await searchParams);
  const rows: ReviewRow[] = getRecordsForReview().flatMap((record) => {
    const patient = getUserById(record.patientId);
    return patient ? [{ record, patient }] : [];
  });
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <RecordsReviewList rows={state === "empty" ? [] : rows} state={state} />
    </>
  );
}
