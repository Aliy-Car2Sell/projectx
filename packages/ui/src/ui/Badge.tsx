import { cn } from "@projectx/utils";

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "neutral" | "accent";

/** Status colours: the 50 as background, the 700 as text. */
const tones: Record<BadgeTone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  neutral: "bg-neutral-100 text-neutral-600",
  accent: "bg-accent-50 text-accent-700",
};

const dots: Record<BadgeTone, string> = {
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  neutral: "bg-neutral-400",
  accent: "bg-accent-500",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-pill", dots[tone])} />}
      {children}
    </span>
  );
}

/** Small "NEW" pill used on records and messages. */
export function NewBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-accent-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      {label}
    </span>
  );
}
