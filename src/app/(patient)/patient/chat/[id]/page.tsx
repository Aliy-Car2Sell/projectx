import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentPatient } from "@/lib/mock/users";
import { getChatById, getChatMessages, patientChats } from "@/lib/mock/chats";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatThread } from "@/components/chat/ChatThread";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = getChatById(id);
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
