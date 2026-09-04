"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, FileText, Paperclip, Send } from "lucide-react";
import type { Chat, ChatMessage } from "@/types";
import { cn, isSameDay } from "@/lib/utils";
import { fmtDate, fmtTime } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";

export function ChatThread({
  chat,
  messages: initial,
  meId,
  backHref,
  profileHref,
}: {
  chat: Chat;
  messages: ChatMessage[];
  meId: string;
  backHref: string;
  profileHref?: string;
}) {
  const t = useTranslations("patient.chat");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const tc = useTranslations("common");
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `local-${Date.now()}`, chatId: chat.id, senderId: meId, text, sentAt: new Date().toISOString() }]);
    setDraft("");
  };

  const dayLabel = (iso: string) => {
    if (isSameDay(iso, 0)) return t("today");
    if (isSameDay(iso, -1)) return t("yesterday");
    return fmtDate(locale, tc, iso.slice(0, 10));
  };

  return (
    <div className="flex flex-col max-md:fixed max-md:inset-x-0 max-md:top-14 max-md:bottom-14 max-md:z-10 md:h-[calc(100dvh-4rem-3rem)] lg:h-[calc(100vh-8rem)] md:rounded-xl md:border md:border-line/60 md:bg-card md:shadow-card overflow-hidden bg-surface">
      {/* Thread header */}
      <div className="flex items-center gap-2 px-2 md:px-4 h-14 border-b border-line bg-card shrink-0">
        <Link href={backHref} className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-surface" aria-label={t("title")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link href={profileHref ?? "#"} className="flex items-center gap-3 min-w-0">
          <Avatar src={chat.participantAvatar} name={chat.participantName} size="sm" />
          <div className="min-w-0">
            <div className="font-bold text-heading text-sm truncate">{chat.participantName}</div>
            <div className="text-xs text-muted truncate">
              {chat.participantRole === "doctor" && chat.participantSubtitle ? ts(chat.participantSubtitle as Parameters<typeof ts>[0]) : chat.participantSubtitle}
            </div>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 bg-surface flex flex-col gap-1.5">
        {messages.map((m, i) => {
          const mine = m.senderId === meId;
          const day = m.sentAt.slice(0, 10);
          const showDay = i === 0 || messages[i - 1].sentAt.slice(0, 10) !== day;
          return (
            <div key={m.id} className="contents">
              {showDay && (
                <div className="self-center my-2 rounded-full bg-card border border-line px-3 py-0.5 text-[11px] text-muted">{dayLabel(m.sentAt)}</div>
              )}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] md:max-w-[70%] rounded-2xl px-3.5 py-2 text-[15px] md:text-sm shadow-sm",
                    mine ? "bg-primary text-white rounded-br-md" : "bg-card text-heading rounded-bl-md",
                  )}
                >
                  {m.attachment?.type === "image" && (
                    <img src={m.attachment.url} alt={m.attachment.name} className="rounded-lg mb-1 max-h-60 w-full object-cover" />
                  )}
                  {m.attachment?.type === "file" && (
                    <div className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 mb-1", mine ? "bg-white/15" : "bg-surface")}>
                      <FileText className="h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{m.attachment.name}</div>
                        {m.attachment.sizeKb && (
                          <div className={cn("text-[11px]", mine ? "text-white/80" : "text-muted")}>
                            {m.attachment.sizeKb >= 1024 ? t("mb", { value: (m.attachment.sizeKb / 1024).toFixed(1) }) : t("kb", { value: m.attachment.sizeKb })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                  <div className={cn("text-[10px] mt-0.5 text-right", mine ? "text-white/75" : "text-muted")}>{fmtTime(m.sentAt)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        className="shrink-0 flex items-end gap-2 border-t border-line bg-card px-2 md:px-3 py-2 safe-bottom"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <button type="button" aria-label={t("attach")} title={t("attach")} className="h-11 w-11 shrink-0 rounded-lg flex items-center justify-center text-muted hover:bg-surface hover:text-primary">
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={t("typeMessage")}
          className="flex-1 resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] md:text-sm min-h-[44px] max-h-32 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button type="submit" aria-label={t("send")} title={t("send")} disabled={!draft.trim()} className="h-11 w-11 shrink-0 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-hover">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
