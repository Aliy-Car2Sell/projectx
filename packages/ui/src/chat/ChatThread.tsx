"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, FileText, Image as ImageIcon, Paperclip, Send, X } from "lucide-react";
import type { Chat, ChatAttachment, ChatMessage, MedicalRecord } from "@projectx/types";
import { cn, isSameDay } from "@projectx/utils";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { getRecordById } from "@projectx/mock/records";
import { Avatar } from "../ui/Avatar";
import { Illustration } from "../illustrations";
import { RecordCard } from "../records/RecordCard";
import { recordDomId } from "../records/RecordEntry";

export function ChatThread({
  chat,
  messages: initial,
  meId,
  backHref,
  profileHref,
  attachRecord,
  recordHrefBase,
}: {
  chat: Chat;
  messages: ChatMessage[];
  meId: string;
  backHref: string;
  profileHref?: string;
  /** "Ask the doctor": this notebook entry rides along with the first message sent. */
  attachRecord?: MedicalRecord;
  /** Page of the notebook that holds attached entries; the card links to `<base>#record-<id>`. */
  recordHrefBase?: string;
}) {
  const t = useTranslations("chat");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const tc = useTranslations("common");
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<ChatAttachment | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(attachRecord ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    // A message may carry only a file or only the attached entry.
    if (!text && !pending && !record) return;
    setMessages((m) => [
      ...m,
      {
        id: `local-${Date.now()}`,
        chatId: chat.id,
        senderId: meId,
        text: text || undefined,
        attachment: pending ?? undefined,
        attachedRecordId: record?.id,
        sentAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
    setPending(null);
    setRecord(null);
  };
  const recordHref = (id: string) => (recordHrefBase ? `${recordHrefBase}#${recordDomId(id)}` : undefined);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    setPending({ type: isImage ? "image" : "file", name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)), url: isImage ? URL.createObjectURL(f) : undefined });
  };

  const dayLabel = (iso: string) => {
    if (isSameDay(iso, 0)) return t("today");
    if (isSameDay(iso, -1)) return t("yesterday");
    return fmtDate(locale, tc, iso.slice(0, 10));
  };

  return (
    <div className="flex flex-col max-md:fixed max-md:inset-x-0 max-md:top-14 max-md:bottom-14 max-md:z-10 md:h-[calc(100dvh-4rem-4rem)] lg:h-[calc(100vh-8.5rem)] md:rounded-lg md:border md:border-neutral-200/70 md:bg-card md:shadow-sm overflow-hidden bg-surface">
      {/* Thread header */}
      <div className="flex items-center gap-2 px-2 md:px-5 h-16 border-b border-line bg-card shrink-0">
        <Link href={backHref} className="md:hidden h-10 w-10 flex items-center justify-center rounded-pill text-neutral-700 hover:bg-neutral-100" aria-label={tc("back")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link href={profileHref ?? "#"} className="flex items-center gap-3 min-w-0">
          <Avatar src={chat.participantAvatar} name={chat.participantName} size="sm" className="h-10 w-10" />
          <div className="min-w-0">
            <div className="font-display font-bold text-heading truncate">{chat.participantName}</div>
            <div className="text-xs font-medium text-primary-700 truncate">
              {chat.participantRole === "doctor" && chat.participantSubtitle ? ts(chat.participantSubtitle as Parameters<typeof ts>[0]) : chat.participantSubtitle}
            </div>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 bg-surface flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="m-auto flex max-w-xs flex-col items-center text-center text-sm text-muted">
            <Illustration name="chat" width={128} className="mb-2" />
            {t("emptyThread")}
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.senderId === meId;
          const day = m.sentAt.slice(0, 10);
          const showDay = i === 0 || messages[i - 1].sentAt.slice(0, 10) !== day;
          return (
            <div key={m.id} className="contents">
              {showDay && (
                <div className="self-center my-2 rounded-pill border border-neutral-200/70 bg-card px-3 py-1 text-xs font-medium text-muted shadow-sm">{dayLabel(m.sentAt)}</div>
              )}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] md:max-w-[70%] rounded-lg px-4 py-2.5 text-base shadow-sm",
                    // Own messages: white on primary-700 (5.15:1). The doctor's: white paper.
                    mine ? "bg-primary-700 text-white rounded-br-xs" : "bg-card text-heading rounded-bl-xs",
                  )}
                >
                  {m.attachedRecordId && (() => {
                    const r = getRecordById(m.attachedRecordId);
                    return r ? <RecordCard record={r} href={recordHref(r.id)} inverse={mine} className="mb-1.5" /> : null;
                  })()}
                  {m.attachment?.type === "image" && (
                    <img src={m.attachment.url} alt={m.attachment.name} className="rounded-md mb-1 max-h-60 w-full object-cover" />
                  )}
                  {m.attachment?.type === "file" && (
                    <div className={cn("flex items-center gap-2 rounded-md px-2.5 py-2 mb-1", mine ? "bg-white/15" : "bg-neutral-100")}>
                      <FileText className="h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{m.attachment.name}</div>
                        {m.attachment.sizeKb && (
                          <div className={cn("text-xs", mine ? "text-primary-50" : "text-muted")}>
                            {m.attachment.sizeKb >= 1024 ? t("mb", { value: (m.attachment.sizeKb / 1024).toFixed(1) }) : t("kb", { value: m.attachment.sizeKb })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                  <div className={cn("text-[11px] mt-1 text-right tabular-nums", mine ? "text-primary-50" : "text-neutral-500")}>{fmtTime(m.sentAt)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        className="shrink-0 flex flex-col border-t border-line bg-card px-2 md:px-4 py-2.5 safe-bottom"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        {record && <RecordCard record={record} onRemove={() => setRecord(null)} className="mb-2" />}
        {pending && (
          <div className="mb-2 inline-flex max-w-full items-center gap-2 self-start rounded-pill border border-primary-200 bg-primary-50 pl-3 pr-1 py-1 text-xs font-medium text-heading">
            {pending.type === "image" ? <ImageIcon className="h-3.5 w-3.5 text-primary-700" /> : <FileText className="h-3.5 w-3.5 text-primary-700" />}
            <span className="truncate max-w-[220px]">{pending.name}</span>
            {pending.sizeKb && <span className="text-muted">· {pending.sizeKb >= 1024 ? t("mb", { value: (pending.sizeKb / 1024).toFixed(1) }) : t("kb", { value: pending.sizeKb })}</span>}
            <button type="button" aria-label={t("removeAttachment")} title={t("removeAttachment")} onClick={() => setPending(null)} className="h-6 w-6 rounded-pill flex items-center justify-center hover:bg-primary-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="sr-only"
          aria-label={t("attach")}
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button type="button" aria-label={t("attach")} title={t("attach")} onClick={() => fileRef.current?.click()} className="h-11 w-11 shrink-0 rounded-pill flex items-center justify-center text-neutral-600 hover:bg-primary-50 hover:text-primary-700">
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
          placeholder={record && messages.length === 0 ? t("attachedRecord.placeholder") : t("typeMessage")}
          className="flex-1 resize-none rounded-lg border border-neutral-300 bg-card px-4 py-2.5 text-base min-h-[44px] max-h-32 placeholder:text-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" aria-label={t("send")} title={t("send")} disabled={!draft.trim() && !pending && !record} className="press h-11 w-11 shrink-0 rounded-pill bg-primary-700 text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-800">
          <Send className="h-5 w-5" />
        </button>
        </div>
      </form>
    </div>
  );
}
