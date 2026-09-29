import { getTranslations } from "next-intl/server";
import { Button } from "@projectx/ui/Button";
import { Illustration } from "@projectx/ui/illustrations";

export default async function NotFound() {
  const t = await getTranslations("states");
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-page">
      <Illustration name="search" width={200} className="mb-4" />
      <h1 className="text-h2 text-primary-900 md:text-h1">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-muted">{t("notFoundDesc")}</p>
      <Button href="/" className="mt-6">
        {t("goHome")}
      </Button>
    </div>
  );
}
