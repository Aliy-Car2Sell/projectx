"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "../ui/Button";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HelpChat } from "../help/HelpChat";

/**
 * Shell for pages a guest may browse (doctor search / profile): no sidebar or bottom nav,
 * just logo, language and a login button that brings the visitor back to the same page.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.login");
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between px-4 md:px-6 lg:px-8 h-14 md:h-16">
          <Logo />
          <div className="flex items-center gap-1 md:gap-2">
            <LanguageSwitcher />
            <Button href={`/login?returnTo=${encodeURIComponent(pathname)}`} size="sm">
              {t("submit")}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 pb-8">{children}</main>
      <HelpChat role="patient" bottomNav={false} />
    </div>
  );
}
