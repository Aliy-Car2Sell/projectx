import { AppShell } from "@projectx/ui/layout/AppShell";
import { currentPatient } from "@projectx/mock/users";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="patient" user={currentPatient} unreadMessages={2}>
      {children}
    </AppShell>
  );
}
