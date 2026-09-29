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
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 bg-card/85 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between px-page h-14 md:h-16">
          <Logo />
          <div className="flex items-center gap-1 md:gap-2">
            <LanguageSwitcher />
            <Button href={`/login?returnTo=${encodeURIComponent(pathname)}`} size="sm">
              {t("submit")}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-page py-5 md:py-8 pb-10 *:animate-enter">{children}</main>
      <HelpChat role="patient" bottomNav={false} />
    </div>
  );
}
