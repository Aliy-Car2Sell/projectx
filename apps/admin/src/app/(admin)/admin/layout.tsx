import { AppShell } from "@projectx/ui/layout/AppShell";
import { currentAdmin } from "@projectx/mock/users";
import { countPendingRecords } from "@projectx/mock/records";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" user={currentAdmin} badges={{ records: countPendingRecords() }}>
      {children}
    </AppShell>
  );
}
