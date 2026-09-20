import { cookies } from "next/headers";
import { AppShell } from "@projectx/ui/layout/AppShell";
import { PublicShell } from "@projectx/ui/layout/PublicShell";
import { currentPatient } from "@projectx/mock/users";
import { SESSION_COOKIE } from "@/lib/session";
import { signOut } from "@/lib/session-actions";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  // Guests only ever get here on the public doctor pages (proxy.ts redirects the rest to /login).
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  if (!signedIn) return <PublicShell>{children}</PublicShell>;
  return (
    <AppShell role="patient" user={currentPatient} unreadMessages={2} logoutAction={signOut}>
      {children}
    </AppShell>
  );
}
