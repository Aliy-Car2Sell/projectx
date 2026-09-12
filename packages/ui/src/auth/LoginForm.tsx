"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, Mail } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

/**
 * Mock login shared by the patient / doctor / admin apps: no backend yet,
 * so a valid form simply enters the app's demo at `homeHref`.
 * `registerHref` / `forgotHref` may point at another app (absolute URL); omit
 * `registerHref` to hide the "no account?" line (admin).
 */
export function LoginForm({
  homeHref,
  registerHref,
  forgotHref,
}: {
  homeHref: string;
  registerHref?: string;
  forgotHref: string;
}) {
  const t = useTranslations("auth.login");
  const router = useRouter();

  return (
    <Card>
      <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
      <p className="text-sm text-muted mt-1 mb-5">{t("subtitle")}</p>
      <form
        className="flex flex-col gap-4"
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(homeHref);
        }}
      >
        <Input
          label={t("email")}
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
        />
        <Input
          label={t("password")}
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
        />
        <div className="flex justify-end -mt-1">
          <Link href={forgotHref} className="text-sm text-primary font-medium hover:underline">
            {t("forgot")}
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg">
          {t("submit")}
        </Button>
      </form>
      {registerHref && (
        <p className="mt-5 text-center text-sm text-muted">
          {t("noAccount")}{" "}
          <Link href={registerHref} className="text-primary font-semibold hover:underline">
            {t("register")}
          </Link>
        </p>
      )}
    </Card>
  );
}
