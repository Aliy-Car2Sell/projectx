import { useTranslations } from "next-intl";
import { MessageSquareText } from "lucide-react";
import type { Chat } from "@projectx/types";
import { cn } from "@projectx/utils";
import { ChatList } from "./ChatList";
import type { DemoState } from "../demo/state";

/**
 * Responsive chat layout: list-only or thread-only on mobile; list + thread side by side on lg.
 */
export function ChatLayout({
  chats,
  basePath,
  activeId,
  state,
  children,
}: {
  chats: Chat[];
  basePath: string;
  activeId?: string;
  state?: DemoState;
  children?: React.ReactNode;
}) {
  const t = useTranslations("chat");
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className={cn(activeId && "hidden lg:block")}>
        <ChatList chats={chats} basePath={basePath} activeId={activeId} state={state} />
      </div>
      <div className={cn(!activeId && "hidden lg:block")}>
        {children ?? (
          <div className="hidden lg:flex h-[calc(100vh-8rem)] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card/60 text-center px-6">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MessageSquareText className="h-7 w-7" />
            </span>
            <h3 className="font-bold text-heading">{t("selectChat")}</h3>
            <p className="text-sm text-muted mt-1">{t("selectChatDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
