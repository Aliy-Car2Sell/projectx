import { safeReturnTo } from "@/lib/session";
import { RegisterForm } from "./RegisterForm";

/**
 * `?role=doctor` (link from the doctor app's login) pre-selects the doctor role and hides the chooser.
 * `?returnTo=` is where a new patient lands after registering.
 */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string; returnTo?: string | string[] }> }) {
  const { role, returnTo } = await searchParams;
  return <RegisterForm initialRole={role === "doctor" ? "doctor" : null} returnTo={safeReturnTo(returnTo)} />;
}
