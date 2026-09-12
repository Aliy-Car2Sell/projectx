"use client";

import Link from "next/link";
import { cn } from "@projectx/utils";

export type TabItem = { key: string; label: string; count?: number; href?: string };

/**
 * Horizontal tabs. Scrolls horizontally on narrow screens instead of wrapping.
 * Works as controlled state tabs (onChange) or as link tabs (href).
 */
export function Tabs({
  items,
  value,
  onChange,
  variant = "underline",
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
        "flex gap-1 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0",
        variant === "underline" ? "border-b border-line" : "bg-surface rounded-lg p-1",
        className,
      )}
    >
      {items.map((it) => {
        const active = it.key === value;
        const classes = cn(
          "shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 text-sm font-semibold transition-colors whitespace-nowrap",
          variant === "underline" &&
            (active
              ? "text-primary border-b-2 border-primary -mb-px"
              : "text-muted hover:text-heading border-b-2 border-transparent -mb-px"),
          variant === "pill" &&
            (active ? "bg-card text-primary rounded-md shadow-sm min-h-[36px]" : "text-muted hover:text-heading min-h-[36px]"),
        );
        const content = (
          <>
            {it.label}
            {typeof it.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] leading-5 min-w-[20px] text-center",
                  active ? "bg-primary text-white" : "bg-line text-muted",
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
