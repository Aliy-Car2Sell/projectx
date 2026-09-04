import { getTranslations } from "next-intl/server";
import { doctorChats } from "@/lib/mock/chats";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemoStates } from "@/components/demo/DemoStates";
import { readDemoState } from "@/components/demo/state";
import { ChatLayout } from "@/components/chat/ChatLayout";

export default async function DoctorChatPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("patient.chat");
  const state = readDemoState(await searchParams);
  return (
    <>
      <PageHeader title={t("title")} />
      <DemoStates />
      <ChatLayout chats={doctorChats} basePath="/doctor/chat" state={state} />
    </>
  );
}
