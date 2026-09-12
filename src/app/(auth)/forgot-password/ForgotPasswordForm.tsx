"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Input } from "@projectx/ui/Input";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Card>
      {sent ? (
        <div className="flex flex-col items-center text-center py-4">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-green-600">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold text-heading">{t("sentTitle")}</h1>
          <p className="mt-1 text-sm text-muted">{t("sentDesc", { email })}</p>
          <Button href="/login" variant="secondary" className="mt-5" icon={<ArrowLeft className="h-4 w-4" />}>
            {t("back")}
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div>
            <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
            <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
          </div>
          <Input
            label={t("email")}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />
          <Button type="submit" fullWidth size="lg">
            {t("submit")}
          </Button>
          <Link href="/login" className="inline-flex items-center justify-center gap-1 text-sm text-muted hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </Link>
        </form>
      )}
    </Card>
  );
}
