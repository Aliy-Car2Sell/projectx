import { redirect } from "next/navigation";

/** The admin app has no landing page: its root goes straight to login. */
export default function AdminRoot() {
  redirect("/login");
}
