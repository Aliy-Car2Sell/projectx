import { getTranslations } from "next-intl/server";
import { doctorChats } from "@projectx/mock/chats";
import { PageHeader } from "@projectx/ui/PageHeader";
import { readDemoState } from "@projectx/ui/demo/state";
import { ChatLayout } from "@projectx/ui/chat/ChatLayout";

export default async function DoctorChatPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("doctor.chat");
  const state = readDemoState(await searchParams);
  return (
    <>
      <PageHeader title={t("title")} />
      <ChatLayout chats={doctorChats} basePath="/doctor/chat" state={state} />
    </>
  );
}
