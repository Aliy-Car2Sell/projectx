"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe, Loader2 } from "lucide-react";
import { locales, type Locale } from "@projectx/i18n/config";
import { setUserLocale } from "@projectx/i18n/locale";
import { cn } from "@projectx/utils";

export function LanguageSwitcher({ className, light }: { className?: string; light?: boolean }) {
  const t = useTranslations("lang");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const change = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold uppercase transition-colors",
          light ? "text-white hover:bg-white/15" : "text-heading hover:bg-black/5",
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
        {locale}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => change(l)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-surface",
                  l === locale ? "text-primary-text font-semibold" : "text-heading",
                )}
              >
                {t(l)}
                {l === locale && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
