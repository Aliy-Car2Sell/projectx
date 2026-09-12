import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Centered card layout for login / register / forgot-password pages (shared by all apps). */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <header className="flex items-center justify-between px-4 md:px-8 h-16">
        <Logo />
        <LanguageSwitcher />
      </header>
      <main className="flex-1 flex items-start md:items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
