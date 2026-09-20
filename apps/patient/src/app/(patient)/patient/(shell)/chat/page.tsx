import { getTranslations } from "next-intl/server";
import { patientChats } from "@projectx/mock/chats";
import { PageHeader } from "@projectx/ui/PageHeader";
import { DemoStates } from "@projectx/ui/demo/DemoStates";
import { readDemoState } from "@projectx/ui/demo/state";
import { ChatLayout } from "@projectx/ui/chat/ChatLayout";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("patient.chat");
  const state = readDemoState(await searchParams);
  return (
    <>
      <PageHeader title={t("title")} />
      <DemoStates />
      <ChatLayout chats={patientChats} basePath="/patient/chat" state={state} />
    </>
  );
}
