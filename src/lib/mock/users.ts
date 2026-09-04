import type { User } from "@/types";

/** Users used to render the shell for each role in demo mode. */
export const currentPatient: User = {
  id: "u-patient-1",
  role: "patient",
  firstName: "Dilnoza",
  lastName: "Karimova",
  email: "dilnoza.karimova@example.com",
  phone: "+998 90 123 45 67",
  avatarUrl: "https://i.pravatar.cc/150?img=47",
  status: "active",
  createdAt: "2026-03-12",
  city: "tashkent",
  birthDate: "1992-06-18",
};

export const currentDoctorUser: User = {
  id: "u-doctor-1",
  role: "doctor",
  firstName: "Bekzod",
  lastName: "Rahimov",
  email: "b.rahimov@example.com",
  phone: "+998 93 555 12 34",
  avatarUrl: "https://i.pravatar.cc/150?img=12",
  status: "active",
  createdAt: "2026-01-20",
  city: "tashkent",
};

export const currentAdmin: User = {
  id: "u-admin-1",
  role: "admin",
  firstName: "Aziz",
  lastName: "Yusupov",
  email: "admin@projectx.uz",
  phone: "+998 71 200 00 00",
  avatarUrl: "https://i.pravatar.cc/150?img=68",
  status: "active",
  createdAt: "2025-12-01",
};

export const users: User[] = [
  currentPatient,
  currentDoctorUser,
  currentAdmin,
  {
    id: "u-patient-2",
    role: "patient",
    firstName: "Jasur",
    lastName: "Tursunov",
    email: "jasur.t@example.com",
    phone: "+998 91 234 56 78",
    avatarUrl: "https://i.pravatar.cc/150?img=53",
    status: "active",
    createdAt: "2026-04-02",
    city: "samarkand",
    birthDate: "1985-11-03",
  },
  {
    id: "u-patient-3",
    role: "patient",
    firstName: "Malika",
    lastName: "Abdullayeva",
    email: "malika.a@example.com",
    phone: "+998 99 345 67 89",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
    status: "active",
    createdAt: "2026-05-15",
    city: "tashkent",
    birthDate: "1998-02-27",
  },
  {
    id: "u-patient-4",
    role: "patient",
    firstName: "Sardor",
    lastName: "Mirzayev",
    email: "sardor.m@example.com",
    phone: "+998 97 456 78 90",
    status: "blocked",
    createdAt: "2026-02-08",
    city: "bukhara",
    birthDate: "1979-08-14",
  },
  {
    id: "u-patient-5",
    role: "patient",
    firstName: "Nigora",
    lastName: "Sobirova",
    email: "nigora.s@example.com",
    phone: "+998 94 567 89 01",
    avatarUrl: "https://i.pravatar.cc/150?img=26",
    status: "active",
    createdAt: "2026-06-21",
    city: "andijan",
    birthDate: "2001-12-05",
  },
  {
    id: "u-patient-6",
    role: "patient",
    firstName: "Otabek",
    lastName: "Qodirov",
    email: "otabek.q@example.com",
    phone: "+998 95 678 90 12",
    avatarUrl: "https://i.pravatar.cc/150?img=59",
    status: "active",
    createdAt: "2026-07-09",
    city: "fergana",
    birthDate: "1990-04-22",
  },
  {
    id: "u-doctor-2",
    role: "doctor",
    firstName: "Gulnora",
    lastName: "Saidova",
    email: "g.saidova@example.com",
    phone: "+998 90 111 22 33",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    status: "active",
    createdAt: "2026-02-14",
    city: "tashkent",
  },
];

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function fullName(u: Pick<User, "firstName" | "lastName">): string {
  return `${u.firstName} ${u.lastName}`;
}
