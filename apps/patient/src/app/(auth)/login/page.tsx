import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { LoginForm } from "@projectx/ui/auth/LoginForm";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <div className="flex flex-col gap-4">
      <LoginForm homeHref="/patient" registerHref="/register" forgotHref="/forgot-password" />

      <Card className="border-dashed">
        <p className="text-sm font-semibold text-heading mb-3">{t("demoTitle")}</p>
        <div className="flex flex-col gap-2">
          <Button href="/patient" variant="secondary" fullWidth icon={<User className="h-4 w-4" />}>
            {t("demoPatient")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
