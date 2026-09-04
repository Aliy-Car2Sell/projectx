import Link from "next/link";
import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
  padding?: "none" | "sm" | "md";
  href?: string;
  onClick?: () => void;
};

const paddings = { none: "", sm: "p-4", md: "p-4 md:p-5" };

export function Card({ className, children, padding = "md", href, onClick }: CardProps) {
  const classes = cn(
    "block bg-card rounded-xl shadow-card border border-line/60",
    paddings[padding],
    (href || onClick) && "transition-shadow hover:shadow-md active:scale-[0.995]",
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
    <div className={cn("flex items-start justify-between gap-3 mb-3", className)}>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-heading leading-tight">{title}</h3>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Purple gradient card for metrics/results. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "accent",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "accent" | "primary" | "white";
  className?: string;
}) {
  const tones = {
    accent: "gradient-accent text-white",
    primary: "gradient-primary text-white",
    white: "bg-card text-heading border border-line/60 shadow-card",
  };
  return (
    <div className={cn("rounded-xl p-4 md:p-5 flex flex-col gap-1", tones[tone], className)}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-sm", tone === "white" ? "text-muted" : "text-white/85")}>{label}</span>
        {icon && <span className={cn(tone === "white" ? "text-primary" : "text-white/90")}>{icon}</span>}
      </div>
      <div className="text-2xl md:text-3xl font-bold leading-tight">{value}</div>
      {hint && <div className={cn("text-xs", tone === "white" ? "text-muted" : "text-white/80")}>{hint}</div>}
    </div>
  );
}
