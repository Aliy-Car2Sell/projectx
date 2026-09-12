import { getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";
import { Button } from "@projectx/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("states");
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 bg-surface">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <SearchX className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold text-primary">{t("notFoundTitle")}</h1>
      <p className="mt-1 text-muted">{t("notFoundDesc")}</p>
      <Button href="/" className="mt-6">
        {t("goHome")}
      </Button>
    </div>
  );
}
