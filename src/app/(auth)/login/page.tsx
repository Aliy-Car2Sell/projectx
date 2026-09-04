import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Lock, Mail, ShieldCheck, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
        <p className="text-sm text-muted mt-1 mb-5">{t("subtitle")}</p>
        <form className="flex flex-col gap-4" action="/patient">
          <Input
            label={t("email")}
            type="email"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
          />
          <Input
            label={t("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <div className="flex justify-end -mt-1">
            <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
              {t("forgot")}
            </Link>
          </div>
          <Button type="submit" fullWidth size="lg">
            {t("submit")}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t("register")}
          </Link>
        </p>
      </Card>

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
