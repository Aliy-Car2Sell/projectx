"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, Search } from "lucide-react";
import type { Chat } from "@projectx/types";
import { cn, isSameDay } from "@projectx/utils";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Input } from "../ui/Input";
import { ListSkeleton } from "../ui/Skeleton";
import type { DemoState } from "../demo/state";

export function ChatList({
  chats,
  basePath,
  activeId,
  state = "normal",
}: {
  chats: Chat[];
  basePath: string;
  activeId?: string;
  state?: DemoState;
}) {
  const t = useTranslations("chat");
  const forPatient = basePath.startsWith("/patient");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const tc = useTranslations("common");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const list = (state === "empty" ? [] : [...chats])
    .filter((c) => !needle || `${c.participantName} ${c.lastMessage}`.toLowerCase().includes(needle))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  const when = (iso: string) => {
    if (isSameDay(iso, 0)) return fmtTime(iso);
    if (isSameDay(iso, -1)) return t("yesterday");
    return fmtDate(locale, tc, iso, "short");
  };

  return (
    <div className="flex flex-col gap-3">
      <Input placeholder={t("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} type="search" />
      {state === "loading" ? (
        <ListSkeleton rows={4} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-7 w-7" />}
          title={t("noChats")}
          description={t(forPatient ? "noChatsDesc" : "noChatsDoctorDesc")}
          action={
            <Button href={forPatient ? "/patient/doctors" : "/doctor/patients"} size="sm">
              {t(forPatient ? "findDoctor" : "toPatients")}
            </Button>
          }
        />
      ) : (
        <ul className="bg-card rounded-xl shadow-card border border-line/60 divide-y divide-line overflow-hidden">
          {list.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <Link
                  href={`${basePath}/${c.id}`}
                  className={cn("flex items-center gap-3 px-3 py-3 min-h-[72px] transition-colors", active ? "bg-primary-soft/70" : "hover:bg-surface")}
                >
                  <Avatar src={c.participantAvatar} name={c.participantName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate", c.unreadCount > 0 ? "font-bold text-heading" : "font-semibold text-heading")}>{c.participantName}</span>
                      <span className={cn("shrink-0 text-xs", c.unreadCount > 0 ? "text-primary-text font-semibold" : "text-muted")}>{when(c.lastMessageAt)}</span>
                    </div>
                    {c.participantSubtitle && c.participantRole === "doctor" && (
                      <div className="text-xs text-primary-text">{ts(c.participantSubtitle as Parameters<typeof ts>[0])}</div>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className={cn("truncate text-sm", c.unreadCount > 0 ? "text-heading" : "text-muted")}>{c.lastMessage}</span>
                      {c.unreadCount > 0 && (
                        <span className="shrink-0 h-5 min-w-[20px] rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center px-1.5">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
