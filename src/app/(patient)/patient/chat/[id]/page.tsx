import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Chat } from "@/types";
import { currentPatient } from "@/lib/mock/users";
import { getDoctorById } from "@/lib/mock/doctors";
import { getChatById, getChatMessages, patientChats } from "@/lib/mock/chats";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatThread } from "@/components/chat/ChatThread";

/** `/patient/chat/new?with=<doctorId>` opens an empty conversation with that doctor. */
function newChatWith(doctorId: string | undefined): Chat | undefined {
  const d = doctorId ? getDoctorById(doctorId) : undefined;
  if (!d) return undefined;
  return {
    id: "new",
    participantId: d.id,
    participantName: `${d.firstName} ${d.lastName}`,
    participantAvatar: d.avatarUrl,
    participantRole: "doctor",
    participantSubtitle: d.specialty,
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  };
}

export default async function ChatThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ with?: string }>;
}) {
  const { id } = await params;
  const { with: withId } = await searchParams;
  const chat = id === "new" ? newChatWith(withId) : getChatById(id);
  if (!chat) notFound();
  const t = await getTranslations("patient.chat");
  return (
    <>
      <PageHeader title={t("title")} className="hidden lg:block" />
      <ChatLayout chats={patientChats} basePath="/patient/chat" activeId={chat.id}>
        <ChatThread chat={chat} messages={getChatMessages(chat.id)} meId={currentPatient.id} backHref="/patient/chat" profileHref={`/patient/doctors/${chat.participantId}`} />
      </ChatLayout>
    </>
  );
}
