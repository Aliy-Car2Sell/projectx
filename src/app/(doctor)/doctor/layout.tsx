import { AppShell } from "@/components/layout/AppShell";
import { currentDoctorUser } from "@/lib/mock/users";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="doctor" user={currentDoctorUser} unreadMessages={3} notifications={1}>
      {children}
    </AppShell>
  );
}
