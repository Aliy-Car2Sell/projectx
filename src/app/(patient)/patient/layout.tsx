import { AppShell } from "@/components/layout/AppShell";
import { currentPatient } from "@/lib/mock/users";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="patient" user={currentPatient} unreadMessages={2} notifications={3}>
      {children}
    </AppShell>
  );
}
