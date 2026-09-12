"use client";

import { appUrl } from "@projectx/utils/urls";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Lock, Mail, Phone, Stethoscope, User } from "lucide-react";
import type { UserRole } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Input } from "@projectx/ui/Input";

/** initialRole (from ?role=doctor) pre-selects the role and hides the chooser. */
export function RegisterForm({ initialRole = null }: { initialRole?: "doctor" | null }) {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [role, setRole] = useState<Extract<UserRole, "patient" | "doctor"> | null>(initialRole);
  const locked = initialRole !== null;

  const roles = [
    { key: "patient" as const, icon: User, title: t("patient"), desc: t("patientDesc") },
    { key: "doctor" as const, icon: Stethoscope, title: t("doctor"), desc: t("doctorDesc") },
  ];

  return (
    <Card>
      <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>

      {!role ? (
        <>
          <p className="text-sm text-muted mt-1 mb-5">{t("chooseRole")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className="group flex flex-col items-start gap-3 rounded-xl border-2 border-line p-4 text-left transition-colors hover:border-primary hover:bg-primary-soft/40 min-h-[120px]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <r.icon className="h-6 w-6" />
                </span>
                <span className="font-bold text-heading text-base">{r.title}</span>
                <span className="text-sm text-muted">{r.desc}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <form
          className="mt-4 flex flex-col gap-4"
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            if (role === "doctor") window.location.assign(appUrl("doctor", "/doctor/onboarding"));
            else router.push("/patient");
          }}
        >
          <div className="flex items-center justify-between rounded-lg bg-primary-soft/60 px-3 py-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Check className="h-4 w-4" />
              {role === "doctor" ? t("doctor") : t("patient")}
            </span>
            {!locked && (
              <button type="button" onClick={() => setRole(null)} className="text-sm text-muted hover:text-primary">
                {t("changeRole")}
              </button>
            )}
          </div>
          <div className={cn("grid grid-cols-1 gap-4", "grid-cols-1 sm:grid-cols-2")}>
            <Input label={t("firstName")} autoComplete="given-name" />
            <Input label={t("lastName")} autoComplete="family-name" />
          </div>
          <Input label={t("email")} type="email" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} />
          <Input
            label={t("phone")}
            type="tel"
            placeholder="+998 __ ___ __ __"
            autoComplete="tel"
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label={t("password")}
            type="password"
            hint={t("passwordHint")}
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <Button type="submit" fullWidth size="lg">
            {t("submit")}
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          {t("login")}
        </Link>
      </p>
    </Card>
  );
}
