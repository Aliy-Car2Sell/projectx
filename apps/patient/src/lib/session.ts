/**
 * Mock session: there is no backend yet, so "signed in" is just this cookie.
 * Kept free of server-only imports because proxy.ts reads it too.
 */
export const SESSION_COOKIE = "px_session";

export const PATIENT_HOME = "/patient";

/** Guests may browse doctor search and doctor profiles; everything else under /patient needs a session. */
export function isPublicPatientPath(pathname: string): boolean {
  return /^\/patient\/doctors(\/[^/]+)?\/?$/.test(pathname);
}

/** Only same-app paths are accepted as a post-login destination (no open redirects). */
export function safeReturnTo(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return PATIENT_HOME;
  return v;
}

/** `/login` or `/register` carrying the page to come back to. */
export function authHref(page: "/login" | "/register", returnTo: string): string {
  return returnTo === PATIENT_HOME ? page : `${page}?returnTo=${encodeURIComponent(returnTo)}`;
}
