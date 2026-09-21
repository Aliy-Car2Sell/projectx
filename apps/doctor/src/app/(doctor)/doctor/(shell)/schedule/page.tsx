import { getTranslations } from "next-intl/server";
import { doctorSchedule } from "@projectx/mock/appointments";
import { PageHeader } from "@projectx/ui/PageHeader";
import { ScheduleEditor } from "@/components/doctor/ScheduleEditor";

export default async function SchedulePage() {
  const t = await getTranslations("doctor.schedule");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("desc")} />
      <ScheduleEditor initial={doctorSchedule} />
    </>
  );
}
