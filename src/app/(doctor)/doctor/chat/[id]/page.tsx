import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentDoctor } from "@/lib/mock/doctors";
import { doctorChats, getChatById, getChatMessages } from "@/lib/mock/chats";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatThread } from "@/components/chat/ChatThread";

export default async function DoctorChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = getChatById(id);
  if (!chat) notFound();
  const t = await getTranslations("patient.chat");
  return (
    <>
      <PageHeader title={t("title")} className="hidden lg:block" />
      <ChatLayout chats={doctorChats} basePath="/doctor/chat" activeId={chat.id}>
        <ChatThread chat={chat} messages={getChatMessages(chat.id)} meId={currentDoctor.id} backHref="/doctor/chat" profileHref={`/doctor/patients/${chat.participantId}`} />
      </ChatLayout>
    </>
  );
}
