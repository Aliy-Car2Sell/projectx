import { useTranslations } from "next-intl";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

/** Temporary page body used until a screen is implemented. */
export function PlaceholderPage({ title }: { title: string }) {
  const t = useTranslations("placeholder");
  return (
    <>
      <PageHeader title={title} />
      <EmptyState icon={<Construction className="h-7 w-7" />} title={t("title")} description={t("desc")} />
    </>
  );
}
