import { getTranslations } from "next-intl/server";
import { Stethoscope } from "lucide-react";
import { appUrl } from "@projectx/utils/urls";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { LoginForm } from "@projectx/ui/auth/LoginForm";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <div className="flex flex-col gap-4">
      {/* One account, many roles: registration and password reset live in the patient app. */}
      <LoginForm
        homeHref="/doctor"
        registerHref={appUrl("patient", "/register?role=doctor")}
        forgotHref={appUrl("patient", "/forgot-password")}
      />

      <Card className="border-dashed">
        <p className="text-sm font-semibold text-heading mb-3">{t("demoTitle")}</p>
        <div className="flex flex-col gap-2">
          <Button href="/doctor" variant="secondary" fullWidth icon={<Stethoscope className="h-4 w-4" />}>
            {t("demoDoctor")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
