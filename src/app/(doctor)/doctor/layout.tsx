import { AppShell } from "@projectx/ui/layout/AppShell";
import { currentDoctorUser } from "@projectx/mock/users";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="doctor" user={currentDoctorUser} unreadMessages={3}>
      {children}
    </AppShell>
  );
}
