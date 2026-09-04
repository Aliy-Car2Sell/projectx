import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { OnboardingWizard } from "@/components/doctor/OnboardingWizard";

export default async function OnboardingPage() {
  const t = await getTranslations("doctor.onboarding");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <OnboardingWizard />
    </>
  );
}
