"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe, Loader2 } from "lucide-react";
import { locales, type Locale } from "@projectx/i18n/config";
import { setUserLocale } from "@projectx/i18n/locale";
import { cn } from "@projectx/utils";

export function LanguageSwitcher({
  className,
  light,
  align = "right",
  side = "bottom",
}: {
  className?: string;
  light?: boolean;
  /** Which edge of the button the menu lines up with. */
  align?: "left" | "right";
  /** Where the menu opens: below the button, or above it (in a footer). */
  side?: "bottom" | "top";
}) {
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
          "press inline-flex h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          light ? "text-white hover:bg-white/15" : "text-neutral-800 hover:bg-neutral-900/5",
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
        {locale}
      </button>
      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-40 w-44 overflow-hidden rounded-md border border-neutral-200/70 bg-card p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            side === "bottom" ? "mt-1" : "bottom-full mb-1",
          )}
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => change(l)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-sm hover:bg-neutral-100",
                  l === locale ? "text-primary-700 font-semibold" : "text-heading",
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
