"use client";

import Link from "next/link";
import { cn } from "@projectx/utils";

const chipBase =
  "press inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-pill border text-sm font-semibold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface [&>svg]:h-4 [&>svg]:w-4";
const chipOn = "bg-primary-100 border-primary-300 text-primary-800";
const chipOff = "bg-card border-neutral-200 text-neutral-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700";

/** A pill that filters or picks: a toggle with `onClick`, a link with `href`. */
export function Chip({
  active,
  disabled,
  children,
  onClick,
  href,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const classes = cn(chipBase, active ? chipOn : chipOff, disabled && "opacity-40 line-through pointer-events-none", className);
  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-pressed={active} className={classes}>
      {children}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", disabled && "opacity-50")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 rounded-pill transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          checked ? "bg-primary-500" : "bg-neutral-300",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-0.5 h-6 w-6 rounded-pill bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      {label && <span className="text-base text-heading">{label}</span>}
    </label>
  );
}
