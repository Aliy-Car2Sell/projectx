import type { ActivityItem, Review } from "@/types";

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export const reviews: Review[] = [
  {
    id: "rev-1",
    appointmentId: "apt-100",
    doctorId: "doc-1",
    patientId: "u-patient-2",
    patientName: "Jasur T.",
    rating: 5,
    text: "Juda malakali shifokor. Hamma narsani tushunarli tushuntirdi, davolash yordam berdi.",
    createdAt: iso(3),
    isHidden: false,
  },
  {
    id: "rev-2",
    appointmentId: "apt-101",
    doctorId: "doc-1",
    patientId: "u-patient-3",
    patientName: "Malika A.",
    rating: 5,
    text: "Qabul o'z vaqtida boshlandi, doktor e'tiborli. Tavsiya qilaman.",
    createdAt: iso(9),
    isHidden: false,
  },
  {
    id: "rev-3",
    appointmentId: "apt-102",
    doctorId: "doc-1",
    patientId: "u-patient-5",
    patientName: "Nigora S.",
    rating: 4,
    text: "Yaxshi doktor, lekin navbat biroz kutdirdi.",
    createdAt: iso(15),
    isHidden: false,
  },
  {
    id: "rev-4",
    appointmentId: "apt-103",
    doctorId: "doc-1",
    patientId: "u-patient-6",
    patientName: "Otabek Q.",
    rating: 5,
    text: "Onamni olib bordim, juda muloyim va professional munosabat.",
    createdAt: iso(22),
    isHidden: false,
  },
  {
    id: "rev-5",
    appointmentId: "apt-104",
    doctorId: "doc-1",
    patientId: "u-patient-4",
    patientName: "Sardor M.",
    rating: 2,
    text: "Narxi qimmat, natija ko'rmadim. Reklama!!! Boshqa klinikaga boring: bestclinic.uz",
    createdAt: iso(30),
    isHidden: false,
    reportReason: "Reklama va haqoratomuz matn",
  },
  {
    id: "rev-6",
    appointmentId: "apt-105",
    doctorId: "doc-1",
    patientId: "u-patient-2",
    patientName: "Jasur T.",
    rating: 3,
    text: "Umuman yaxshi, lekin qabul juda qisqa bo'ldi.",
    createdAt: iso(40),
    isHidden: false,
  },
  {
    id: "rev-7",
    appointmentId: "apt-106",
    doctorId: "doc-3",
    patientId: "u-patient-3",
    patientName: "Malika A.",
    rating: 5,
    text: "Tishimni og'riqsiz davoladi. Klinika toza va zamonaviy.",
    createdAt: iso(5),
    isHidden: false,
  },
  {
    id: "rev-8",
    appointmentId: "apt-107",
    doctorId: "doc-3",
    patientId: "u-patient-6",
    patientName: "Otabek Q.",
    rating: 4,
    text: "Yaxshi mutaxassis. Narxlar o'rtacha.",
    createdAt: iso(18),
    isHidden: false,
  },
  {
    id: "rev-9",
    appointmentId: "apt-5",
    doctorId: "doc-5",
    patientId: "u-patient-1",
    patientName: "Dilnoza K.",
    rating: 4,
    text: "Toshma 5 kunda ketdi. Rahmat!",
    createdAt: iso(25),
    isHidden: false,
  },
  {
    id: "rev-10",
    appointmentId: "apt-108",
    doctorId: "doc-2",
    patientId: "u-patient-5",
    patientName: "Nigora S.",
    rating: 1,
    text: "Bu doktor haqida yomon gaplar eshitganman, bormang.",
    createdAt: iso(2),
    isHidden: true,
    reportReason: "Qabulda bo'lmagan, asossiz sharh",
  },
  {
    id: "rev-11",
    appointmentId: "apt-109",
    doctorId: "doc-7",
    patientId: "u-patient-2",
    patientName: "Jasur T.",
    rating: 5,
    text: "Ko'zimga lazer operatsiya qilindi, endi ko'zoynaksiz ko'ryapman.",
    createdAt: iso(12),
    isHidden: false,
  },
  {
    id: "rev-12",
    appointmentId: "apt-110",
    doctorId: "doc-9",
    patientId: "u-patient-6",
    patientName: "Otabek Q.",
    rating: 5,
    text: "Tizza bo'g'imini davoladi, endi og'riqsiz yuraman.",
    createdAt: iso(1),
    isHidden: false,
  },
];

export function getDoctorReviews(doctorId: string, includeHidden = false): Review[] {
  return reviews
    .filter((r) => r.doctorId === doctorId && (includeHidden || !r.isHidden))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Count of reviews per star (1..5) for the given doctor. */
export function ratingDistribution(doctorId: string): Record<1 | 2 | 3 | 4 | 5, number> {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of getDoctorReviews(doctorId)) dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
  return dist;
}

export const recentActivity: ActivityItem[] = [
  { id: "act-1", type: "doctor_applied", text: "Botir Karimov (Ortoped, Farg'ona)", at: iso(0) },
  { id: "act-2", type: "review_reported", text: "Sardor M. → Bekzod Rahimov", at: iso(0) },
  { id: "act-3", type: "user_registered", text: "Otabek Qodirov", at: iso(1) },
  { id: "act-4", type: "appointment_created", text: "Dilnoza Karimova → Sherzod Umarov", at: iso(1) },
  { id: "act-5", type: "doctor_applied", text: "Madina Ismoilova (Dermatolog, Buxoro)", at: iso(1) },
  { id: "act-6", type: "review_posted", text: "Otabek Q. → Alisher Yo'ldoshev (5★)", at: iso(1) },
  { id: "act-7", type: "user_registered", text: "Nigora Sobirova", at: iso(2) },
  { id: "act-8", type: "doctor_applied", text: "Umid Shodiyev (Terapevt, Toshkent)", at: iso(2) },
];
