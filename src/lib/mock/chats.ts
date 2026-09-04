import type { Chat, ChatMessage } from "@/types";

function iso(daysAgo: number, hh: number, mm: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

/** Chats as seen by the demo patient (u-patient-1). */
export const patientChats: Chat[] = [
  {
    id: "chat-1",
    participantId: "doc-1",
    participantName: "Bekzod Rahimov",
    participantAvatar: "https://i.pravatar.cc/150?img=12",
    participantRole: "doctor",
    participantSubtitle: "cardiologist",
    lastMessage: "Tahlil natijalarini ko'rdim, hammasi yaxshi. Ertaga qabulda batafsil gaplashamiz.",
    lastMessageAt: iso(0, 10, 42),
    unreadCount: 2,
  },
  {
    id: "chat-2",
    participantId: "doc-3",
    participantName: "Sherzod Umarov",
    participantAvatar: "https://i.pravatar.cc/150?img=15",
    participantRole: "doctor",
    participantSubtitle: "dentist",
    lastMessage: "Rentgen suratini yuboring, iltimos.",
    lastMessageAt: iso(1, 18, 5),
    unreadCount: 0,
  },
  {
    id: "chat-3",
    participantId: "doc-5",
    participantName: "Jamshid Abdullayev",
    participantAvatar: "https://i.pravatar.cc/150?img=51",
    participantRole: "doctor",
    participantSubtitle: "dermatologist",
    lastMessage: "Rahmat, sog' bo'ling!",
    lastMessageAt: iso(28, 12, 30),
    unreadCount: 0,
  },
];

/** Chats as seen by the demo doctor (doc-1 / u-doctor-1). */
export const doctorChats: Chat[] = [
  {
    id: "dchat-1",
    participantId: "u-patient-1",
    participantName: "Dilnoza Karimova",
    participantAvatar: "https://i.pravatar.cc/150?img=47",
    participantRole: "patient",
    lastMessage: "Rahmat, doktor. Ertaga 16:30 da bo'laman.",
    lastMessageAt: iso(0, 10, 45),
    unreadCount: 1,
  },
  {
    id: "dchat-2",
    participantId: "u-patient-2",
    participantName: "Jasur Tursunov",
    participantAvatar: "https://i.pravatar.cc/150?img=53",
    participantRole: "patient",
    lastMessage: "Xolter natijasini yukladim, ko'rib chiqa olasizmi?",
    lastMessageAt: iso(0, 8, 12),
    unreadCount: 2,
  },
  {
    id: "dchat-3",
    participantId: "u-patient-6",
    participantName: "Otabek Qodirov",
    participantAvatar: "https://i.pravatar.cc/150?img=59",
    participantRole: "patient",
    lastMessage: "Bugun soat 15:00 ga yozildim.",
    lastMessageAt: iso(1, 20, 3),
    unreadCount: 0,
  },
  {
    id: "dchat-4",
    participantId: "u-patient-3",
    participantName: "Malika Abdullayeva",
    participantAvatar: "https://i.pravatar.cc/150?img=44",
    participantRole: "patient",
    lastMessage: "📎 ekg-malika.jpg",
    lastMessageAt: iso(1, 9, 40),
    unreadCount: 0,
  },
];

export const messages: ChatMessage[] = [
  // chat-1: patient <-> doc-1
  { id: "m-1", chatId: "chat-1", senderId: "u-patient-1", text: "Assalomu alaykum, doktor. Qon tahlilini topshirdim, natijani yubordim.", sentAt: iso(0, 9, 15) },
  {
    id: "m-2",
    chatId: "chat-1",
    senderId: "u-patient-1",
    attachment: { type: "file", name: "qon-tahlili.pdf", sizeKb: 240 },
    sentAt: iso(0, 9, 16),
  },
  { id: "m-3", chatId: "chat-1", senderId: "doc-1", text: "Vaalaykum assalom. Ko'rib chiqaman.", sentAt: iso(0, 9, 50) },
  {
    id: "m-4",
    chatId: "chat-1",
    senderId: "doc-1",
    text: "Tahlil natijalarini ko'rdim, hammasi yaxshi. Ertaga qabulda batafsil gaplashamiz.",
    sentAt: iso(0, 10, 42),
  },
  {
    id: "m-5",
    chatId: "chat-1",
    senderId: "doc-1",
    attachment: { type: "image", name: "ekg.jpg", url: "https://picsum.photos/seed/ekg/480/300", sizeKb: 512 },
    sentAt: iso(0, 10, 43),
  },
  // chat-2: patient <-> doc-3
  { id: "m-10", chatId: "chat-2", senderId: "u-patient-1", text: "Salom, tishim juda og'riyapti. Qachon qabulga kelsam bo'ladi?", sentAt: iso(1, 17, 30) },
  { id: "m-11", chatId: "chat-2", senderId: "doc-3", text: "Salom. Bo'sh vaqtlar jadvalda ko'rinadi, yozilib qo'ying.", sentAt: iso(1, 17, 55) },
  { id: "m-12", chatId: "chat-2", senderId: "doc-3", text: "Rentgen suratini yuboring, iltimos.", sentAt: iso(1, 18, 5) },
  // chat-3
  { id: "m-20", chatId: "chat-3", senderId: "doc-5", text: "Loratadinni 7 kun ichib, holatingizni yozib turing.", sentAt: iso(28, 12, 0) },
  { id: "m-21", chatId: "chat-3", senderId: "u-patient-1", text: "Xo'p, rahmat!", sentAt: iso(28, 12, 20) },
  { id: "m-22", chatId: "chat-3", senderId: "doc-5", text: "Rahmat, sog' bo'ling!", sentAt: iso(28, 12, 30) },
  // dchat-1: doctor <-> patient-1 (mirror of chat-1 from doctor side)
  { id: "m-30", chatId: "dchat-1", senderId: "u-patient-1", text: "Assalomu alaykum, doktor. Qon tahlilini topshirdim, natijani yubordim.", sentAt: iso(0, 9, 15) },
  { id: "m-31", chatId: "dchat-1", senderId: "u-patient-1", attachment: { type: "file", name: "qon-tahlili.pdf", sizeKb: 240 }, sentAt: iso(0, 9, 16) },
  { id: "m-32", chatId: "dchat-1", senderId: "doc-1", text: "Vaalaykum assalom. Ko'rib chiqaman.", sentAt: iso(0, 9, 50) },
  { id: "m-33", chatId: "dchat-1", senderId: "doc-1", text: "Tahlil natijalarini ko'rdim, hammasi yaxshi. Ertaga qabulda batafsil gaplashamiz.", sentAt: iso(0, 10, 42) },
  { id: "m-34", chatId: "dchat-1", senderId: "u-patient-1", text: "Rahmat, doktor. Ertaga 16:30 da bo'laman.", sentAt: iso(0, 10, 45) },
  // dchat-2
  { id: "m-40", chatId: "dchat-2", senderId: "u-patient-2", text: "Salom doktor, kecha Xolter apparatini topshirdim.", sentAt: iso(0, 8, 10) },
  { id: "m-41", chatId: "dchat-2", senderId: "u-patient-2", attachment: { type: "file", name: "holter.pdf", sizeKb: 1180 }, sentAt: iso(0, 8, 11) },
  { id: "m-42", chatId: "dchat-2", senderId: "u-patient-2", text: "Xolter natijasini yukladim, ko'rib chiqa olasizmi?", sentAt: iso(0, 8, 12) },
  // dchat-3
  { id: "m-50", chatId: "dchat-3", senderId: "u-patient-6", text: "Assalomu alaykum. Ko'krak qafasida og'riq bor, qabulga kelsam bo'ladimi?", sentAt: iso(1, 19, 40) },
  { id: "m-51", chatId: "dchat-3", senderId: "doc-1", text: "Albatta. Agar og'riq kuchaysa, darhol tez yordam chaqiring.", sentAt: iso(1, 19, 55) },
  { id: "m-52", chatId: "dchat-3", senderId: "u-patient-6", text: "Bugun soat 15:00 ga yozildim.", sentAt: iso(1, 20, 3) },
  // dchat-4
  { id: "m-60", chatId: "dchat-4", senderId: "u-patient-3", text: "EKG suratini yuboryapman.", sentAt: iso(1, 9, 39) },
  { id: "m-61", chatId: "dchat-4", senderId: "u-patient-3", attachment: { type: "image", name: "ekg-malika.jpg", url: "https://picsum.photos/seed/ekg2/480/300", sizeKb: 640 }, sentAt: iso(1, 9, 40) },
];

export function getChatMessages(chatId: string): ChatMessage[] {
  return messages.filter((m) => m.chatId === chatId).sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

export function getChatById(id: string): Chat | undefined {
  return [...patientChats, ...doctorChats].find((c) => c.id === id);
}
