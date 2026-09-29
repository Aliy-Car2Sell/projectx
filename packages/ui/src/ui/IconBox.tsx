import { cn } from "@projectx/utils";

export type IconTone = "primary" | "accent" | "teal" | "indigo" | "success" | "warning" | "danger" | "neutral";

/** Soft: light background + dark icon (the duo-tone look). Solid: filled + white icon (the active state). */
const soft: Record<IconTone, string> = {
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-50 text-accent-700",
  teal: "bg-teal-50 text-teal-700",
  indigo: "bg-indigo-50 text-indigo-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  neutral: "bg-neutral-100 text-neutral-700",
};

const solid: Record<IconTone, string> = {
  primary: "bg-primary-500 text-white",
  accent: "bg-accent-500 text-white",
  teal: "bg-teal-500 text-white",
  indigo: "bg-indigo-500 text-white",
  success: "bg-success-500 text-white",
  warning: "bg-warning-500 text-white",
  danger: "bg-danger-500 text-white",
  neutral: "bg-neutral-800 text-white",
};

const sizes = {
  sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
  md: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5", // navigation
  lg: "h-11 w-11 [&>svg]:h-[22px] [&>svg]:w-[22px]", // cards
  xl: "h-12 w-12 [&>svg]:h-6 [&>svg]:w-6",
};

/**
 * The container every icon sits in: no icon is drawn bare.
 * Navigation uses the rounded square (`md`), cards the circle (`lg` / `xl`).
 */
export function IconBox({
  children,
  tone = "primary",
  size = "lg",
  shape = "circle",
  active,
  className,
}: {
  children: React.ReactNode;
  tone?: IconTone;
  size?: keyof typeof sizes;
  shape?: "circle" | "square";
  /** Filled with the tone's 500 and a white icon. */
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors",
        shape === "circle" ? "rounded-pill" : "rounded-md",
        sizes[size],
        active ? solid[tone] : soft[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
