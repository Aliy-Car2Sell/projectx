"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, MessageCircle } from "lucide-react";
import type { User, UserRole } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationsMenu } from "./NotificationsMenu";
import { HelpChat } from "../help/HelpChat";
import { chatHrefByRole, isActive, navByRole, profileHrefByRole } from "./nav";

/**
 * Role-aware application shell.
 * - < md: compact top header + bottom navigation (5 items)
 * - md..lg: icon-only sidebar
 * - >= lg: full sidebar with user card + top header
 */
export function AppShell({
  role,
  user,
  unreadMessages = 0,
  logoutAction,
  children,
}: {
  role: UserRole;
  user: User;
  unreadMessages?: number;
  /** Server action ending the session; without it "log out" just links to /login. */
  logoutAction?: () => Promise<void>;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const items = navByRole[role];
  const bottomItems = items.filter((i) => i.bottom).slice(0, 5);
  const homeHref = items[0].href;
  const chatHref = chatHrefByRole[role];
  const fullName = `${user.firstName} ${user.lastName}`;
  const logoutClass =
    "flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-base md:text-[15px] font-medium text-muted hover:bg-surface hover:text-danger justify-center lg:justify-start";

  return (
    <div className="min-h-dvh flex bg-surface">
      {/* Sidebar (tablet: icons, desktop: full) */}
      <aside className="hidden md:flex md:flex-col md:w-[72px] lg:w-64 shrink-0 bg-card border-r border-line sticky top-0 h-dvh">
        <div className="flex items-center justify-center lg:justify-start px-3 lg:px-5 h-16 border-b border-line">
          <Logo href={homeHref} compact className="lg:hidden" />
          <Logo href={homeHref} className="max-lg:hidden" />
        </div>

        <div className="hidden lg:block px-4 pt-4">
          <Link
            href={profileHrefByRole[role]}
            className="flex items-center gap-3 rounded-xl bg-primary-soft/70 p-3 hover:bg-primary-soft transition-colors"
          >
            <Avatar src={user.avatarUrl} name={fullName} size="md" ring />
            <div className="min-w-0">
              <div className="font-bold text-heading truncate">{t("shell.greeting", { name: user.firstName })}</div>
              <div className="text-xs text-muted">{t(`shell.role.${role}`)}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 lg:px-3 py-4 flex flex-col gap-1" aria-label={t("common.menu")}>
          {items.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const label = t(`nav.${role}.${item.key}`);
            return (
              <Link
                key={item.key}
                href={item.href}
                title={label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-base md:text-[15px] font-medium transition-colors justify-center lg:justify-start",
                  active ? "bg-primary-soft text-primary-text font-semibold" : "text-heading hover:bg-surface",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline truncate">{label}</span>
                {item.key === "chat" && unreadMessages > 0 && (
                  <span className="max-lg:hidden inline-flex ml-auto rounded-full px-1.5 min-w-[20px] h-5 items-center justify-center text-[11px] font-bold bg-primary text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 lg:px-3 pb-4">
          {logoutAction ? (
            <form action={logoutAction}>
              <button type="submit" title={t("common.logout")} className={cn(logoutClass, "w-full")}>
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline">{t("common.logout")}</span>
              </button>
            </form>
          ) : (
            <Link href="/login" className={logoutClass}>
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{t("common.logout")}</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-line h-14 md:h-16 flex items-center px-3 md:px-6 gap-2">
          <Logo href={homeHref} className="md:hidden" />
          <div className="ml-auto flex items-center gap-0.5 md:gap-1">
            <LanguageSwitcher />
            {chatHref && (
              <Link
                href={chatHref}
                aria-label={t("common.messages")}
                className="relative max-sm:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-heading hover:bg-black/5"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] rounded-full bg-danger px-1 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            )}
            <NotificationsMenu role={role} />
            <Link href={profileHrefByRole[role]} className="ml-1 flex items-center gap-2 rounded-lg p-1 hover:bg-black/5">
              <Avatar src={user.avatarUrl} name={fullName} size="sm" />
              <span className="hidden lg:block text-sm font-semibold text-heading pr-1">{user.firstName}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      <HelpChat role={role} />

      {/* Bottom navigation (mobile) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-line safe-bottom"
        aria-label={t("common.menu")}
      >
        <ul className="grid grid-cols-5">
          {bottomItems.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium",
                    active ? "text-primary-text" : "text-muted",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                  <span className="truncate max-w-full px-1">{t.has(`navShort.${role}.${item.key}`) ? t(`navShort.${role}.${item.key}`) : t(`nav.${role}.${item.key}`)}</span>
                  {item.key === "chat" && unreadMessages > 0 && (
                    <span className="absolute top-1.5 right-[calc(50%-18px)] h-4 min-w-[16px] rounded-full bg-danger px-1 text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
