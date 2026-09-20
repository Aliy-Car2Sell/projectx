"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, safeReturnTo } from "./session";

/** Mock sign-in (login, register and the demo button all end here), then back to `returnTo`. */
export async function signIn(returnTo?: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "patient", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  redirect(safeReturnTo(returnTo));
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
