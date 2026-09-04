import { getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/layout/Placeholder";

export default async function Page() {
  const t = await getTranslations("nav.patient");
  return <PlaceholderPage title={t("records")} />;
}
