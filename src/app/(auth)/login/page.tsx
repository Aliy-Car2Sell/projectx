import { getTranslations } from "next-intl/server";
import { ShieldCheck, Stethoscope, User } from "lucide-react";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <div className="flex flex-col gap-4">
      <LoginForm />

      <Card className="border-dashed">
        <p className="text-sm font-semibold text-heading mb-3">{t("demoTitle")}</p>
        <div className="flex flex-col gap-2">
          <Button href="/patient" variant="secondary" fullWidth icon={<User className="h-4 w-4" />}>
            {t("demoPatient")}
          </Button>
          <Button href="/doctor" variant="secondary" fullWidth icon={<Stethoscope className="h-4 w-4" />}>
            {t("demoDoctor")}
          </Button>
          <Button href="/admin" variant="secondary" fullWidth icon={<ShieldCheck className="h-4 w-4" />}>
            {t("demoAdmin")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
