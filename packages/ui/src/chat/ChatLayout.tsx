import { useTranslations } from "next-intl";
import type { Chat } from "@projectx/types";
import { cn } from "@projectx/utils";
import { Illustration } from "../illustrations";
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
    // No enter animation on phones: the thread is position:fixed there and must not be held by a moving parent.
    <div className="grid grid-cols-1 gap-4 max-md:animate-none! lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className={cn(activeId && "hidden lg:block")}>
        <ChatList chats={chats} basePath={basePath} activeId={activeId} state={state} />
      </div>
      <div className={cn(!activeId && "hidden lg:block")}>
        {children ?? (
          <div className="hidden lg:flex h-[calc(100vh-8.5rem)] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-card/70 text-center px-6">
            <Illustration name="chat" className="mb-4" />
            <h3 className="text-h3 text-heading">{t("selectChat")}</h3>
            <p className="text-sm text-muted mt-1.5">{t("selectChatDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
