"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Bell, CalendarDays, CheckCheck, ClipboardCheck, FileCheck2, FolderHeart, MessageCircle, MessageSquareWarning, Star, UserPlus, XCircle, type LucideIcon } from "lucide-react";
import type { UserRole } from "@projectx/types";
import { getNotifications, type MockNotification, type NotificationType } from "@projectx/mock/notifications";
import { fmtDate, fmtTime } from "@projectx/utils/dates";
import { cn, isSameDay } from "@projectx/utils";
import { Modal } from "../ui/Modal";

const icons: Record<NotificationType, { icon: LucideIcon; cls: string }> = {
  appointmentReminder: { icon: CalendarDays, cls: "bg-primary-50 text-primary-700" },
  newBooking: { icon: CalendarDays, cls: "bg-success-50 text-success-700" },
  newMessage: { icon: MessageCircle, cls: "bg-primary-50 text-primary-700" },
  newRecord: { icon: FolderHeart, cls: "bg-accent-50 text-accent-700" },
  recordUrgent: { icon: AlertTriangle, cls: "bg-danger-50 text-danger-700" },
  recordAttention: { icon: AlertTriangle, cls: "bg-warning-50 text-warning-700" },
  recordApproved: { icon: ClipboardCheck, cls: "bg-success-50 text-success-700" },
  recordRejected: { icon: XCircle, cls: "bg-danger-50 text-danger-700" },
  recordPending: { icon: ClipboardCheck, cls: "bg-warning-50 text-warning-700" },
  recordUploaded: { icon: FolderHeart, cls: "bg-success-50 text-success-700" },
  reviewRequest: { icon: Star, cls: "bg-warning-50 text-warning-700" },
  newApplication: { icon: FileCheck2, cls: "bg-warning-50 text-warning-700" },
  reviewReported: { icon: MessageSquareWarning, cls: "bg-danger-50 text-danger-700" },
  userRegistered: { icon: UserPlus, cls: "bg-primary-50 text-primary-700" },
};

/**
 * Header bell with a mock notification list: dropdown on md+, bottom sheet on phones.
 * Read state lives in the session only (no backend yet).
 */
export function NotificationsMenu({ role }: { role: UserRole }) {
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [items, setItems] = useState<MockNotification[]>(() => getNotifications(role));
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open || isMobile) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isMobile]);

  const markAll = () => setItems((list) => list.map((i) => ({ ...i, read: true })));
  const markOne = (id: string) => setItems((list) => list.map((i) => (i.id === id ? { ...i, read: true } : i)));
  const when = (at: string) => (isSameDay(at, 0) ? fmtTime(at) : fmtDate(locale, tc, at, "short"));

  const list = (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-1 pb-2 md:px-4 md:pt-3">
        <span className="text-xs text-muted">{unread > 0 ? t("unread", { count: unread }) : t("empty")}</span>
        {unread > 0 && (
          <button type="button" onClick={markAll} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-text hover:underline min-h-[32px]">
            <CheckCheck className="h-3.5 w-3.5" /> {t("markAllRead")}
          </button>
        )}
      </div>
      <ul className="divide-y divide-line md:max-h-[420px] md:overflow-y-auto">
        {items.map((n) => {
          const { icon: Icon, cls } = icons[n.type];
          return (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => {
                  markOne(n.id);
                  setOpen(false);
                }}
                className={cn("flex items-start gap-3 px-1 py-3 md:px-4 hover:bg-neutral-50 transition-colors", !n.read && "bg-primary-50/60")}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-pill", cls)}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm leading-snug", n.read ? "text-heading" : "font-semibold text-heading")}>
                    {t(`types.${n.type}`, n.params)}
                  </span>
                  <span className="block text-xs text-muted mt-0.5">{when(n.at)}</span>
                </span>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-pill bg-primary-500" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("title")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-pill text-neutral-700 hover:bg-neutral-900/5 hover:text-heading"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && !isMobile && (
        <div role="dialog" aria-label={t("title")} className="absolute right-0 z-40 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-neutral-200/70 bg-card shadow-lg animate-enter">
          <div className="px-4 pt-4 font-display text-lg font-bold text-heading">{t("title")}</div>
          {list}
        </div>
      )}
      {isMobile && (
        <Modal open={open} onClose={() => setOpen(false)} title={t("title")} closeLabel={tc("close")}>
          {list}
        </Modal>
      )}
    </div>
  );
}
