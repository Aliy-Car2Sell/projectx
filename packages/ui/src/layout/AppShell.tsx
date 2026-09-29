"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CircleHelp, LogOut, MessageCircle } from "lucide-react";
import type { User, UserRole } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationsMenu } from "./NotificationsMenu";
import { HelpChat } from "../help/HelpChat";
import { chatHrefByRole, isActive, navByRole, profileHrefByRole } from "./nav";

/** The 40px rounded square an icon of the navigation sits in; filled with the app's accent when active. */
const navIcon = (active: boolean) =>
  cn(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors [&>svg]:h-5 [&>svg]:w-5",
    active ? "bg-accent-500 text-white shadow-sm" : "bg-accent-50 text-accent-700 group-hover:bg-accent-100",
  );
const navRow = "group flex items-center gap-3 rounded-md p-1 lg:pr-3 min-h-[48px] text-[15px] font-medium transition-colors justify-center lg:justify-start";
const counter = "rounded-pill bg-danger-600 px-1 text-[10px] font-bold text-white flex items-center justify-center";

/**
 * Role-aware application shell.
 * - < md: compact top header + bottom navigation (5 items)
 * - md..lg: icon-only sidebar
 * - >= lg: 264px sidebar with logo, user card, menu, help and log out
 */
export function AppShell({
  role,
  user,
  unreadMessages = 0,
  badges,
  logoutAction,
  children,
}: {
  role: UserRole;
  user: User;
  unreadMessages?: number;
  /** Counts shown on nav items by key (e.g. `{ records: 6 }` for the admin's review queue). */
  badges?: Partial<Record<string, number>>;
  /** Server action ending the session; without it "log out" just links to /login. */
  logoutAction?: () => Promise<void>;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);
  const items = navByRole[role];
  const bottomItems = items.filter((i) => i.bottom).slice(0, 5);
  const homeHref = items[0].href;
  const chatHref = chatHrefByRole[role];
  const fullName = `${user.firstName} ${user.lastName}`;
  const badgeOf = (key: string) => (key === "chat" ? unreadMessages : (badges?.[key] ?? 0));
  const footRow = cn(navRow, "w-full text-muted hover:bg-neutral-100 hover:text-heading");
  const footIcon = "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700 transition-colors [&>svg]:h-5 [&>svg]:w-5";

  return (
    <div className="min-h-dvh flex">
      {/* Sidebar (tablet: icons, desktop: full) */}
      <aside className="hidden md:flex md:flex-col md:w-[76px] lg:w-[264px] shrink-0 bg-card border-r border-line sticky top-0 h-dvh">
        <div className="flex items-center justify-center lg:justify-start px-3 lg:px-6 h-16 shrink-0">
          <Logo href={homeHref} compact className="lg:hidden" />
          <Logo href={homeHref} className="max-lg:hidden" />
        </div>

        <div className="hidden lg:block px-4 pt-1">
          <Link
            href={profileHrefByRole[role]}
            className="flex items-center gap-3 rounded-lg border border-accent-100 bg-accent-50 p-3 transition-colors hover:border-accent-300"
          >
            <Avatar src={user.avatarUrl} name={fullName} size="md" ring />
            <div className="min-w-0">
              <div className="font-display font-bold text-heading truncate">{fullName}</div>
              <div className="text-xs font-medium text-accent-700">{t(`shell.role.${role}`)}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 lg:px-4 py-4 flex flex-col gap-1" aria-label={t("common.menu")}>
          {items.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const label = t(`nav.${role}.${item.key}`);
            const count = badgeOf(item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                title={label}
                aria-current={active ? "page" : undefined}
                className={cn(navRow, "relative", active ? "bg-accent-50 font-semibold text-accent-700" : "text-neutral-700 hover:bg-neutral-100 hover:text-heading")}
              >
                <span className={navIcon(active)}>
                  <Icon />
                </span>
                <span className="hidden lg:inline truncate">{label}</span>
                {count > 0 && (
                  <>
                    <span className={cn(counter, "max-lg:hidden ml-auto h-5 min-w-[20px] px-1.5 text-[11px]")}>{count}</span>
                    <span className={cn(counter, "lg:hidden absolute right-1.5 top-0.5 h-4 min-w-[16px] ring-2 ring-card")}>{count}</span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-line px-3 lg:px-4 py-3">
          <button type="button" title={t("help.title")} onClick={() => setHelpOpen(true)} className={footRow}>
            <span className={footIcon}>
              <CircleHelp />
            </span>
            <span className="hidden lg:inline">{t("help.title")}</span>
          </button>
          {logoutAction ? (
            <form action={logoutAction}>
              <button type="submit" title={t("common.logout")} className={cn(footRow, "hover:text-danger-700")}>
                <span className={footIcon}>
                  <LogOut />
                </span>
                <span className="hidden lg:inline">{t("common.logout")}</span>
              </button>
            </form>
          ) : (
            <Link href="/login" title={t("common.logout")} className={cn(footRow, "hover:text-danger-700")}>
              <span className={footIcon}>
                <LogOut />
              </span>
              <span className="hidden lg:inline">{t("common.logout")}</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-card/85 backdrop-blur-md border-b border-line h-14 md:h-16 flex items-center px-4 md:px-6 lg:px-8 gap-2">
          <Logo href={homeHref} className="md:hidden" />
          <div className="ml-auto flex items-center gap-0.5 md:gap-1">
            <LanguageSwitcher />
            {chatHref && (
              <Link
                href={chatHref}
                aria-label={t("common.messages")}
                className="relative max-sm:hidden inline-flex h-11 w-11 items-center justify-center rounded-pill text-neutral-700 hover:bg-neutral-900/5 hover:text-heading"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadMessages > 0 && <span className={cn(counter, "absolute top-1.5 right-1.5 h-4 min-w-[16px]")}>{unreadMessages}</span>}
              </Link>
            )}
            <NotificationsMenu role={role} />
            <Link href={profileHrefByRole[role]} className="ml-1 flex items-center gap-2 rounded-pill p-1 lg:pr-3 hover:bg-neutral-900/5">
              <Avatar src={user.avatarUrl} name={fullName} size="sm" />
              <span className="hidden lg:block text-sm font-semibold text-heading">{user.firstName}</span>
            </Link>
          </div>
        </header>

        {/* What a page renders is mounted anew on every navigation, so it enters with the page animation. */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-page py-5 md:py-8 pb-28 md:pb-10 *:animate-enter">{children}</main>
      </div>

      <HelpChat role={role} open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Bottom navigation (mobile) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/85 backdrop-blur-md border-t border-line safe-bottom"
        aria-label={t("common.menu")}
      >
        <ul className="grid grid-cols-5">
          {bottomItems.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const count = badgeOf(item.key);
            return (
              <li key={item.key} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] leading-none",
                    active ? "font-semibold text-accent-700" : "font-medium text-muted",
                  )}
                >
                  <span className={cn(navIcon(active), "h-7 w-12 rounded-pill", !active && "bg-transparent text-neutral-600")}>
                    <Icon />
                  </span>
                  <span className="truncate max-w-full px-1">{t.has(`navShort.${role}.${item.key}`) ? t(`navShort.${role}.${item.key}`) : t(`nav.${role}.${item.key}`)}</span>
                  {count > 0 && <span className={cn(counter, "absolute top-1 left-[calc(50%+10px)] h-4 min-w-[16px] ring-2 ring-card")}>{count}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
