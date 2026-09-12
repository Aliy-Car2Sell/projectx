"use client";

import { cn } from "@projectx/utils";

export function Chip({
  active,
  disabled,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-primary border-primary text-white"
          : "bg-card border-line text-heading hover:border-primary hover:text-primary",
        disabled && "opacity-40 line-through pointer-events-none",
        className,
      )}
    >
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
          "relative h-7 w-12 rounded-full transition-colors shrink-0",
          checked ? "bg-primary" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      {label && <span className="text-[15px] text-heading">{label}</span>}
    </label>
  );
}
