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

/** A number that matters: the figure large, its label small, the icon in its container. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  /** Colour of the icon container ("white" is the old name of "primary"). */
  tone?: StatTone;
  href?: string;
  className?: string;
}) {
  const classes = cn(
    "flex items-start justify-between gap-3 rounded-lg border border-neutral-200/70 bg-card p-5 shadow-sm",
    href && "lift hover:border-primary-200",
    className,
  );
  const body = (
    <>
      <div className="min-w-0">
        <div className="font-display text-h1 leading-none text-heading">{value}</div>
        <div className="mt-2 text-sm font-medium text-muted">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-neutral-500">{hint}</div>}
      </div>
      {icon && (
        <IconBox tone={tone === "white" ? "primary" : tone} size="lg">
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
