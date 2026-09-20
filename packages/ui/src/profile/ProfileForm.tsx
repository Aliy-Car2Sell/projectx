"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, KeyRound, LogOut, Save, UserRound } from "lucide-react";
import type { User } from "@projectx/types";
import { locales, type Locale } from "@projectx/i18n/config";
import { setUserLocale } from "@projectx/i18n/locale";
import { cityKeys } from "@projectx/mock/doctors";
import { cn } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { AvatarUpload } from "../ui/AvatarUpload";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Toast } from "../ui/Toast";
import { ReplayGuideLink } from "../help/FirstRunGuide";

/** Shared profile editor for patient and doctor accounts. */
export function ProfileForm({
  user,
  extra,
  logoutAction,
  guideHref,
}: {
  user: User;
  extra?: React.ReactNode;
  /** Server action ending the session; without it "log out" just links to /login. */
  logoutAction?: () => Promise<void>;
  /** Page that shows the first-run guide; adds a "show it again" link. */
  guideHref?: string;
}) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const tl = useTranslations("lang");
  const th = useTranslations("help.guide");
  const tcity = useTranslations("cities");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const save = () => {
    setToast(t("saved"));
    setTimeout(() => setToast(null), 2000);
  };

  const changeLocale = (l: Locale) => {
    startTransition(async () => {
      await setUserLocale(l);
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title={t("personal")} />
          <div className="mb-4">
            <AvatarUpload src={user.avatarUrl} name={`${user.firstName} ${user.lastName}`} label={t("changePhoto")}>
              <div className="text-xs text-muted mt-2">{t("memberSince", { date: fmtDate(locale, tc, user.createdAt) })}</div>
            </AvatarUpload>
          </div>
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <Input label={t("firstName")} defaultValue={user.firstName} />
            <Input label={t("lastName")} defaultValue={user.lastName} />
            <Input label={t("phone")} type="tel" defaultValue={user.phone} />
            <Input label={t("email")} type="email" defaultValue={user.email} />
            {user.birthDate !== undefined && <Input label={t("birthDate")} type="date" defaultValue={user.birthDate} />}
            <Select label={t("city")} defaultValue={user.city ?? ""} placeholder="—" options={cityKeys.map((k) => ({ value: k, label: tcity(k) }))} />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" icon={<Save className="h-4 w-4" />}>
                {t("save")}
              </Button>
            </div>
          </form>
        </Card>

        {extra}

        <Card>
          <CardHeader title={t("changePassword")} />
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <Input label={t("currentPassword")} type="password" autoComplete="current-password" leftIcon={<KeyRound className="h-4 w-4" />} />
            <Input label={t("newPassword")} type="password" autoComplete="new-password" />
            <Input label={t("confirmPassword")} type="password" autoComplete="new-password" />
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" variant="secondary">
                {t("changePassword")}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title={t("language")} subtitle={t("languageDesc")} action={<Globe className="h-5 w-5 text-primary" />} />
          <div className="flex flex-col gap-2">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                disabled={pending}
                onClick={() => changeLocale(l)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 min-h-[44px] text-base md:text-[15px] transition-colors",
                  l === locale ? "border-primary bg-primary-soft text-primary font-semibold" : "border-line hover:border-primary",
                )}
              >
                {tl(l)}
                <span className="text-xs uppercase text-muted">{l}</span>
              </button>
            ))}
          </div>
        </Card>

        {guideHref && (
          <Card>
            <ReplayGuideLink href={guideHref} className="min-h-[44px]" />
            <p className="text-sm text-muted">{th("replayDesc")}</p>
          </Card>
        )}

        <Card>
          <CardHeader title={t("logout")} subtitle={t("logoutDesc")} action={<UserRound className="h-5 w-5 text-muted" />} />
          {logoutAction ? (
            <form action={logoutAction}>
              <Button type="submit" variant="danger" fullWidth icon={<LogOut className="h-4 w-4" />}>
                {tc("logout")}
              </Button>
            </form>
          ) : (
            <Button href="/login" variant="danger" fullWidth icon={<LogOut className="h-4 w-4" />}>
              {tc("logout")}
            </Button>
          )}
        </Card>
      </div>

      <Toast message={toast} />
    </div>
  );
}
