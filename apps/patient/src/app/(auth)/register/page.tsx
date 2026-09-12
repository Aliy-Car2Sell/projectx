import { RegisterForm } from "./RegisterForm";

/** `?role=doctor` (link from the doctor app's login) pre-selects the doctor role and hides the chooser. */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <RegisterForm initialRole={role === "doctor" ? "doctor" : null} />;
}
