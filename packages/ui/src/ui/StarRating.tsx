"use client";

import { Star } from "lucide-react";
import { cn } from "@projectx/utils";

/**
 * Star rating. Read-only by default; pass onChange to make it interactive.
 */
export function StarRating({
  value,
  onChange,
  size = "sm",
  showValue,
  count,
  countLabel,
  className,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  countLabel?: string;
  className?: string;
}) {
  const px = { xs: "h-3.5 w-3.5", sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9" }[size];
  const interactive = Boolean(onChange);
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className={cn("flex", interactive ? "gap-1" : "gap-0.5")} role={interactive ? "radiogroup" : undefined}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value >= n - 0.25;
          const half = !filled && value >= n - 0.75;
          const star = (
            <span className="relative inline-block">
              <Star className={cn(px, "text-line")} fill="currentColor" strokeWidth={0} />
              <span className={cn("absolute inset-0 overflow-hidden", filled ? "w-full" : half ? "w-1/2" : "w-0")}>
                <Star className={cn(px, "text-warning")} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
          if (!interactive) return <span key={n}>{star}</span>;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n}`}
              className="rounded-md p-0.5 transition-transform hover:scale-110 active:scale-95"
              onClick={() => onChange?.(n)}
            >
              {star}
            </button>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-semibold text-heading ml-0.5">{value.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-xs text-muted">({countLabel ?? count})</span>
      )}
    </div>
  );
}
