"use client";

import Link from "next/link";
import { cn } from "@projectx/utils";

export type TabItem = { key: string; label: string; count?: number; href?: string };

/**
 * Tabs as a pill segment (the `underline` look stays for long lists of sections).
 * Scrolls horizontally on narrow screens instead of wrapping.
 * Works as controlled state tabs (onChange) or as link tabs (href).
 */
export function Tabs({
  items,
  value,
  onChange,
  variant = "pill",
  className,
}: {
  items: TabItem[];
  value: string;
  onChange?: (key: string) => void;
  variant?: "underline" | "pill";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex overflow-x-auto scrollbar-none",
        variant === "underline"
          ? "gap-1 border-b border-line -mx-5 px-5 md:mx-0 md:px-0"
          : "gap-1 rounded-pill bg-neutral-100 p-1 max-w-full w-fit",
        className,
      )}
    >
      {items.map((it) => {
        const active = it.key === value;
        const classes = cn(
          "shrink-0 inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          variant === "underline" &&
            cn(
              "min-h-[44px] px-3 border-b-2 -mb-px",
              active ? "text-primary-700 border-primary-500" : "text-muted hover:text-heading border-transparent",
            ),
          variant === "pill" &&
            cn(
              "min-h-[40px] px-4 rounded-pill",
              active ? "bg-card text-primary-700 shadow-sm" : "text-muted hover:text-heading",
            ),
        );
        const content = (
          <>
            {it.label}
            {typeof it.count === "number" && (
              <span
                className={cn(
                  "rounded-pill px-1.5 text-[11px] leading-5 min-w-[20px] text-center",
                  active ? "bg-primary-50 text-primary-700" : "bg-neutral-200 text-neutral-600",
                )}
              >
                {it.count}
              </span>
            )}
          </>
        );
        if (it.href) {
          return (
            <Link key={it.key} href={it.href} role="tab" aria-selected={active} className={classes}>
              {content}
            </Link>
          );
        }
        return (
          <button key={it.key} type="button" role="tab" aria-selected={active} className={classes} onClick={() => onChange?.(it.key)}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
