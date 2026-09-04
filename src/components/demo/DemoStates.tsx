"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

import { readDemoState, type DemoState } from "./state";

/**
 * Small row of links to preview empty / loading / error states of a list page.
 * Mock-up only; will be removed once real data is wired.
 */
export function DemoStates({ className }: { className?: string }) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = readDemoState({ state: sp.get("state") ?? undefined });
  const items: { key: DemoState; label: string }[] = [
    { key: "normal", label: t("stateNormal") },
    { key: "empty", label: t("stateEmpty") },
    { key: "loading", label: t("stateLoading") },
    { key: "error", label: t("stateError") },
  ];
  return (
    <div className={cn("flex flex-wrap items-center gap-1 text-[11px] text-muted mb-3", className)}>
      <span className="mr-1 uppercase tracking-wide">{t("demoStates")}:</span>
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.key === "normal" ? pathname : `${pathname}?state=${it.key}`}
          className={cn(
            "rounded-full border px-2 py-0.5",
            current === it.key ? "border-accent text-accent bg-accent-soft" : "border-line hover:text-heading",
          )}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
