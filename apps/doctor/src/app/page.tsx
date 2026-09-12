import { redirect } from "next/navigation";

/** The doctor app has no landing page: its root goes straight to login. */
export default function DoctorRoot() {
  redirect("/login");
}
