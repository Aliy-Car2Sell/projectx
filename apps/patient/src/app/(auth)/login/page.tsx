import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { LoginForm } from "@projectx/ui/auth/LoginForm";
import { authHref, safeReturnTo } from "@/lib/session";
import { signIn } from "@/lib/session-actions";

/** `?returnTo=` (set by proxy.ts and the guest header) is where a successful login lands. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const t = await getTranslations("auth.login");
  const returnTo = safeReturnTo((await searchParams).returnTo);
  const login = signIn.bind(null, returnTo);
  return (
    <div className="flex flex-col gap-4">
      <LoginForm homeHref={returnTo} registerHref={authHref("/register", returnTo)} forgotHref="/forgot-password" onLogin={login} />

      <Card className="border-dashed">
        <p className="text-sm font-semibold text-heading mb-3">{t("demoTitle")}</p>
        <form action={login} className="flex flex-col gap-2">
          <Button type="submit" variant="secondary" fullWidth icon={<User className="h-4 w-4" />}>
            {t("demoPatient")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
