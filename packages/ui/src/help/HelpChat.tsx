"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, CircleHelp, Send, X } from "lucide-react";
import type { UserRole } from "@projectx/types";
import { cn } from "@projectx/utils";
import { helpTopics, mockHelpSource, type HelpAnswer, type HelpSource } from "./helpSource";

type Message = { id: number; from: "user"; text: string } | { id: number; from: "bot"; answer: HelpAnswer };

/**
 * Round "?" button (bottom right, above the mobile bottom nav) that opens a small help chat:
 * quick-question chips with ready answers, plus free text. Hidden on chat and print pages.
 * `bottomNav={false}` for shells without a bottom navigation (guest header).
 */
export function HelpChat({ role, source, bottomNav = true }: { role: UserRole; source?: HelpSource; bottomNav?: boolean }) {
  const t = useTranslations("help");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [text, setText] = useState("");
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const ask = useMemo(() => source ?? mockHelpSource(t), [source, t]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  if (/\/(chat|print)(\/|$)/.test(pathname)) return null;
  // The doctor profile keeps its own sticky call-to-action bar at the bottom on mobile.
  const lifted = /^\/patient\/doctors\/[^/]+$/.test(pathname);

  const send = async (question: string, topic?: string) => {
    if (!question.trim() || pending) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: question.trim() }]);
    setText("");
    setPending(true);
    try {
      const answer = await ask({ role, topic, text: question.trim() });
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", answer }]);
    } catch {
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", answer: { text: t("error") } }]);
    } finally {
      setPending(false);
    }
  };

  const mobileBottom = lifted ? (bottomNav ? "max-md:bottom-[148px]" : "max-md:bottom-[92px]") : bottomNav ? "max-md:bottom-[72px]" : "max-md:bottom-4";

  return (
    <div className="record-noprint">
      {!open && (
        <button
          type="button"
          aria-label={t("open")}
          title={t("open")}
          onClick={() => setOpen(true)}
          className={cn("fixed right-4 md:right-6 md:bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 safe-bottom", mobileBottom)}
        >
          <CircleHelp className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div role="dialog" aria-label={t("title")} className="fixed z-50 inset-x-0 bottom-0 md:inset-x-auto md:right-6 md:bottom-6 md:w-[380px]">
          <button type="button" aria-label={t("close")} onClick={() => setOpen(false)} className="md:hidden fixed inset-0 -z-10 bg-black/40" />
          <div className="flex max-h-[80dvh] md:h-[540px] md:max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-t-2xl md:rounded-2xl border border-line bg-card shadow-2xl">
            <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-white">
              <div className="min-w-0">
                <h2 className="font-bold leading-tight text-white">{t("title")}</h2>
                <p className="text-sm text-white/90">{t("subtitle")}</p>
              </div>
              <button type="button" aria-label={t("close")} onClick={() => setOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5" aria-live="polite">
              <Bubble from="bot">{t("greeting")}</Bubble>
              <div className="flex flex-wrap gap-1.5">
                {helpTopics[role].map((topic) => (
                  <button
                    key={topic.key}
                    type="button"
                    disabled={pending}
                    onClick={() => send(t(`${role}.topics.${topic.key}.q`), topic.key)}
                    className="min-h-[36px] rounded-full border border-primary/40 bg-primary-soft px-3 text-left text-sm font-medium text-primary-text hover:border-primary disabled:opacity-50"
                  >
                    {t(`${role}.topics.${topic.key}.q`)}
                  </button>
                ))}
              </div>
              {messages.map((m) =>
                m.from === "user" ? (
                  <Bubble key={m.id} from="user">
                    {m.text}
                  </Bubble>
                ) : (
                  <Bubble key={m.id} from="bot">
                    <p>{m.answer.text}</p>
                    {m.answer.steps && (
                      <ol className="mt-1.5 list-decimal pl-5 flex flex-col gap-1">
                        {m.answer.steps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    )}
                    {m.answer.link && (
                      <Link href={m.answer.link.href} onClick={() => setOpen(false)} className="mt-2 inline-flex min-h-[36px] items-center gap-1 font-semibold text-primary-text hover:underline">
                        {m.answer.link.label} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </Bubble>
                ),
              )}
              {pending && <Bubble from="bot">…</Bubble>}
              <div ref={endRef} />
            </div>

            <form
              className="flex items-center gap-2 border-t border-line p-2 safe-bottom"
              onSubmit={(e) => {
                e.preventDefault();
                void send(text);
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-base md:text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <button type="submit" aria-label={t("send")} disabled={!text.trim() || pending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-40">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ from, children }: { from: "bot" | "user"; children: React.ReactNode }) {
  return (
    <div className={cn("max-w-[88%] rounded-2xl px-3 py-2 leading-snug", from === "bot" ? "self-start rounded-bl-md bg-surface text-heading" : "self-end rounded-br-md bg-primary text-white")}>{children}</div>
  );
}
