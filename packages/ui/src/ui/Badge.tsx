import { cn } from "@projectx/utils";

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "neutral" | "accent";

const tones: Record<BadgeTone, string> = {
  primary: "bg-primary-soft text-primary-text",
  success: "bg-success-soft text-green-700",
  warning: "bg-warning-soft text-amber-700",
  danger: "bg-danger-soft text-red-700",
  neutral: "bg-surface text-muted border border-line",
  accent: "bg-accent-soft text-accent",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Small "NEW" pill used on records and messages. */
export function NewBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md gradient-accent px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
      {label}
    </span>
  );
}
