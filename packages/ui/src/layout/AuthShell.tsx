import { getTranslations } from "next-intl/server";
import { Badge } from "../ui/Badge";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Centered card layout for login / register / forgot-password pages (shared by all apps).
 * The "demo mode" badge is the only place that says so, and only when NEXT_PUBLIC_DEMO=true.
 */
export async function AuthShell({ children }: { children: React.ReactNode }) {
  const demo = process.env.NEXT_PUBLIC_DEMO === "true";
  const t = await getTranslations("shell");
  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <header className="flex items-center justify-between px-4 md:px-8 h-16">
        <span className="inline-flex items-center gap-2">
          <Logo />
          {demo && <Badge tone="accent">{t("demoBadge")}</Badge>}
        </span>
        <LanguageSwitcher />
      </header>
      <main className="flex-1 flex items-start md:items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
