"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, Mail } from "lucide-react";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Input } from "@projectx/ui/Input";

/** Mock login: no backend yet, so a valid form simply enters the patient demo. */
export function LoginForm() {
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
          router.push("/patient");
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
  );
}
