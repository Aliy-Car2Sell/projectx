import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Chat } from "@projectx/types";
import { currentDoctor } from "@projectx/mock/doctors";
import { getUserById } from "@projectx/mock/users";
import { doctorChats, getChatById, getChatMessages } from "@projectx/mock/chats";
import { getSharedPatientRecords } from "@projectx/mock/records";
import { PageHeader } from "@projectx/ui/PageHeader";
import { ChatLayout } from "@projectx/ui/chat/ChatLayout";
import { ChatThread } from "@projectx/ui/chat/ChatThread";

/** `/doctor/chat/new?with=<patientUserId>` opens an empty conversation with that patient. */
function newChatWith(userId: string | undefined): Chat | undefined {
  const u = userId ? getUserById(userId) : undefined;
  if (!u || u.role !== "patient") return undefined;
  return {
    id: "new",
    participantId: u.id,
    participantName: `${u.firstName} ${u.lastName}`,
    participantAvatar: u.avatarUrl,
    participantRole: "patient",
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  };
}

export default async function DoctorChatThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ with?: string; record?: string }>;
}) {
  const { id } = await params;
  const { with: withId, record: recordId } = await searchParams;
  const chat = id === "new" ? newChatWith(withId) : getChatById(id);
  if (!chat) notFound();
  // `?record=<id>`: only an entry of this patient the doctor may see (approved, not private).
  const attachRecord = recordId ? getSharedPatientRecords(chat.participantId).find((r) => r.id === recordId) : undefined;
  const t = await getTranslations("doctor.chat");
  return (
    <>
      <PageHeader title={t("title")} className="hidden lg:block" />
      <ChatLayout chats={doctorChats} basePath="/doctor/chat" activeId={chat.id}>
        <ChatThread
          chat={chat}
          messages={getChatMessages(chat.id)}
          meId={currentDoctor.id}
          backHref="/doctor/chat"
          profileHref={`/doctor/patients/${chat.participantId}`}
          attachRecord={attachRecord}
          recordHrefBase={`/doctor/patients/${chat.participantId}`}
        />
      </ChatLayout>
    </>
  );
}
