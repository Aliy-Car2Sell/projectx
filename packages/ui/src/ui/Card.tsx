import Link from "next/link";
import { cn } from "@projectx/utils";
import { IconBox, type IconTone } from "./IconBox";

type Accent = "primary" | "accent" | "success" | "warning" | "danger";

type CardProps = {
  className?: string;
  children: React.ReactNode;
  padding?: "none" | "sm" | "md";
  href?: string;
  onClick?: () => void;
  /** Lifts on hover. A card with `href` or `onClick` is interactive without asking. */
  interactive?: boolean;
  /** Set apart from its neighbours by a coloured line on the left. */
  accent?: Accent;
};

const paddings = { none: "", sm: "p-4", md: "p-5 md:p-6" };

const accentLine: Record<Accent, string> = {
  primary: "before:bg-primary-500",
  accent: "before:bg-accent-500",
  success: "before:bg-success-500",
  warning: "before:bg-warning-500",
  danger: "before:bg-danger-500",
};

export function Card({ className, children, padding = "md", href, onClick, interactive, accent }: CardProps) {
  const classes = cn(
    "block bg-card rounded-lg shadow-sm border border-neutral-200/70",
    paddings[padding],
    (href || onClick || interactive) && "lift hover:border-primary-200",
    accent &&
      cn(
        "relative before:absolute before:left-0 before:top-5 before:bottom-5 before:w-1 before:rounded-r-pill",
        accentLine[accent],
      ),
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, "w-full text-left")}>
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-heading leading-tight">{title}</h3>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type StatTone = IconTone | "white";

/**
 * A number that matters: the figure large, its label small, the icon in its container.
 * `compact` lets three of them share a phone's width: there the icon goes on top and the hint is dropped.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  href,
  compact,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  /** Colour of the icon container ("white" is the old name of "primary"). */
  tone?: StatTone;
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  const classes = cn(
    "flex min-w-0 rounded-lg border border-neutral-200/70 bg-card shadow-sm",
    compact ? "max-sm:flex-col max-sm:gap-2.5 max-sm:p-3.5 sm:items-start sm:justify-between sm:gap-3 sm:p-5" : "items-start justify-between gap-3 p-5",
    href && "lift hover:border-primary-200",
    className,
  );
  const body = (
    <>
      <div className="min-w-0">
        <div className={cn("font-display text-h1 leading-none text-heading", compact && "max-sm:text-h2 max-sm:leading-none")}>{value}</div>
        <div className={cn("mt-2 text-sm font-medium text-muted", compact && "max-sm:mt-1.5 max-sm:text-xs max-sm:leading-tight")}>{label}</div>
        {hint && <div className={cn("mt-0.5 text-xs text-neutral-500", compact && "max-sm:hidden")}>{hint}</div>}
      </div>
      {icon && (
        <IconBox tone={tone === "white" ? "primary" : tone} size="lg" className={cn(compact && "max-sm:order-first max-sm:h-9 max-sm:w-9 max-sm:[&>svg]:h-[18px] max-sm:[&>svg]:w-[18px]")}>
          {icon}
        </IconBox>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}
