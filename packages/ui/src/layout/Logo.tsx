import Link from "next/link";
import { cn } from "@projectx/utils";

/**
 * The ProjectX mark: a speech bubble with the medical cross in it (talking to a doctor).
 * One colour, drawn on a 32px grid so it stays clean at 24, 32 and 48px.
 * The favicon and the PWA icons are made from the same path: `node scripts/make-icons.mjs`.
 */
export const LOGO_BUBBLE =
  "M9.5 3h13A7.5 7.5 0 0 1 30 10.5v8a7.5 7.5 0 0 1-7.5 7.5h-7.3l-5.9 4.4c-.8.6-1.9 0-1.9-1v-3.7A7.5 7.5 0 0 1 2 18.5v-8A7.5 7.5 0 0 1 9.5 3z";
export function LogoMark({
  size = 32,
  light,
  className,
}: {
  size?: number;
  /** On a coloured background: white bubble, brand-coloured sign. */
  light?: boolean;
  className?: string;
}) {
  const sign = light ? "var(--color-primary-500)" : "#fff";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d={LOGO_BUBBLE} fill={light ? "#fff" : "var(--color-primary-500)"} />
      <rect x="14.2" y="8.5" width="3.6" height="12" rx="1.8" fill={sign} />
      <rect x="10" y="12.7" width="12" height="3.6" rx="1.8" fill={sign} />
    </svg>
  );
}

export function Logo({
  href = "/",
  compact,
  className,
  light,
  size = 32,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
  light?: boolean;
  size?: number;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label="ProjectX">
      <LogoMark size={size} light={light} />
      {!compact && (
        <span
          className={cn(
            "font-display text-[19px] font-extrabold leading-none tracking-[-0.03em]",
            light ? "text-white" : "text-primary-900",
          )}
        >
          Project<span className={light ? undefined : "text-primary-500"}>X</span>
        </span>
      )}
    </Link>
  );
}
