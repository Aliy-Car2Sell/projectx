"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CalendarCheck, FolderHeart, Stethoscope, type LucideIcon } from "lucide-react";
import { cn } from "@projectx/utils";
import { Button } from "../ui/Button";

const KEY = "px_guide_seen";
const EVENT = "px-guide-change";
const icons: LucideIcon[] = [Stethoscope, CalendarCheck, FolderHeart];

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const readSeen = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true; // storage blocked: do not nag on every visit
  }
};
const writeSeen = (seen: boolean) => {
  try {
    if (seen) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
};

/** Light three-step overlay shown the first time the patient dashboard opens. "Skip" is always there. */
export function FirstRunGuide() {
  const t = useTranslations("help.guide");
  // Server and first client render say "seen", so nothing flashes and hydration matches.
  const seen = useSyncExternalStore(subscribe, readSeen, () => true);
  const [step, setStep] = useState(0);
  const last = step === icons.length - 1;

  useEffect(() => {
    if (seen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && writeSeen(true);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [seen]);

  if (seen) return null;
  const Icon = icons[step];

  return (
    <div role="dialog" aria-modal="true" aria-label={t("title")} className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/45 p-0 md:p-4">
      <div className="w-full md:max-w-sm rounded-t-2xl md:rounded-2xl bg-card p-5 pb-6 shadow-2xl safe-bottom">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted">{t("progress", { step: step + 1, total: icons.length })}</span>
          <button type="button" onClick={() => writeSeen(true)} className="min-h-[44px] px-2 text-sm font-medium text-muted hover:text-primary">
            {t("skip")}
          </button>
        </div>
        <div className="mt-2 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-heading">
            {step + 1} — {t(`steps.${step}.title`)}
          </h2>
          <p className="mt-1.5 text-muted">{t(`steps.${step}.text`)}</p>
        </div>
        <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
          {icons.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-1.5 bg-line")} />
          ))}
        </div>
        <Button
          fullWidth
          size="lg"
          className="mt-5"
          onClick={() => {
            if (last) writeSeen(true);
            else setStep((s) => s + 1);
          }}
        >
          {last ? t("start") : t("next")}
        </Button>
      </div>
    </div>
  );
}

/** "Show the guide again" (profile page): forget that it was seen and go to the dashboard, where it opens. */
export function ReplayGuideLink({ href, className }: { href: string; className?: string }) {
  const t = useTranslations("help.guide");
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        writeSeen(false);
        router.push(href);
      }}
      className={cn("text-left font-medium text-primary hover:underline", className)}
    >
      {t("replay")}
    </button>
  );
}
