import { AppShell } from "@/components/layout/AppShell";
import { currentAdmin } from "@/lib/mock/users";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" user={currentAdmin} notifications={5}>
      {children}
    </AppShell>
  );
}
