import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Clock,
  FileCheck2,
  FolderHeart,
  Home,
  LayoutDashboard,
  MessageCircle,
  MessageSquareWarning,
  Star,
  Stethoscope,
  UserCircle,
  Users,
} from "lucide-react";
import type { UserRole } from "@projectx/types";

export type NavItem = {
  key: string; // translation key under nav.<role>
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Show in mobile bottom navigation (max 5). */
  bottom?: boolean;
};

export const navByRole: Record<UserRole, NavItem[]> = {
  patient: [
    { key: "home", href: "/patient", icon: Home, exact: true, bottom: true },
    { key: "doctors", href: "/patient/doctors", icon: Stethoscope, bottom: true },
    { key: "appointments", href: "/patient/appointments", icon: CalendarDays, bottom: true },
    { key: "records", href: "/patient/records", icon: FolderHeart, bottom: true },
    { key: "chat", href: "/patient/chat", icon: MessageCircle, bottom: true },
    { key: "profile", href: "/patient/profile", icon: UserCircle },
  ],
  doctor: [
    { key: "home", href: "/doctor", icon: Home, exact: true, bottom: true },
    { key: "appointments", href: "/doctor/appointments", icon: CalendarDays, bottom: true },
    { key: "schedule", href: "/doctor/schedule", icon: Clock, bottom: true },
    { key: "patients", href: "/doctor/patients", icon: Users, bottom: true },
    { key: "chat", href: "/doctor/chat", icon: MessageCircle, bottom: true },
    { key: "reviews", href: "/doctor/reviews", icon: Star },
    { key: "profile", href: "/doctor/profile", icon: UserCircle },
  ],
  admin: [
    { key: "dashboard", href: "/admin", icon: LayoutDashboard, exact: true, bottom: true },
    { key: "applications", href: "/admin/applications", icon: FileCheck2, bottom: true },
    { key: "doctors", href: "/admin/doctors", icon: Stethoscope, bottom: true },
    { key: "reviews", href: "/admin/reviews", icon: MessageSquareWarning, bottom: true },
    { key: "users", href: "/admin/users", icon: Users, bottom: true },
    { key: "profile", href: "/admin/profile", icon: UserCircle },
  ],
};

export const profileHrefByRole: Record<UserRole, string> = {
  patient: "/patient/profile",
  doctor: "/doctor/profile",
  admin: "/admin/profile",
};

/** Header chat shortcut; admins have no chat, so nothing is rendered for them. */
export const chatHrefByRole: Record<UserRole, string | null> = {
  patient: "/patient/chat",
  doctor: "/doctor/chat",
  admin: null,
};

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
