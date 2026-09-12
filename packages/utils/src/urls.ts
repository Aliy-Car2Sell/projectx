/**
 * Absolute origins of the sibling apps, for cross-app links
 * (e.g. admin -> a doctor's public profile in the patient app).
 * Values come from NEXT_PUBLIC_*_URL (see each app's `.env`); nothing is hard-coded.
 */
export type AppName = "patient" | "doctor" | "admin";

// Referenced literally so Next.js can inline them into client bundles.
const origins: Record<AppName, string | undefined> = {
  patient: process.env.NEXT_PUBLIC_PATIENT_URL,
  doctor: process.env.NEXT_PUBLIC_DOCTOR_URL,
  admin: process.env.NEXT_PUBLIC_ADMIN_URL,
};

/** Build an absolute URL into another app: appUrl("doctor", "/doctor/profile"). */
export function appUrl(app: AppName, path = ""): string {
  const origin = origins[app];
  if (!origin) throw new Error(`NEXT_PUBLIC_${app.toUpperCase()}_URL is not set`);
  return origin.replace(/\/+$/, "") + path;
}
