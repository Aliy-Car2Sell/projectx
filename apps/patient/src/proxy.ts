import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isPublicPatientPath } from "@/lib/session";

/** Guests hitting a protected patient page are sent to login and brought back afterwards. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (request.cookies.has(SESSION_COOKIE) || isPublicPatientPath(pathname)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("returnTo", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/patient/:path*"],
};
