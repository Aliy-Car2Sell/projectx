import { AppShell } from "@projectx/ui/layout/AppShell";
import { currentAdmin } from "@projectx/mock/users";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" user={currentAdmin}>
      {children}
    </AppShell>
  );
}
