import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "inverse" | "inverseAccent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
  secondary: "bg-card text-primary border border-primary hover:bg-primary-soft",
  ghost: "bg-transparent text-heading hover:bg-black/5",
  danger: "bg-danger text-white hover:bg-red-600",
  accent: "gradient-accent text-white hover:opacity-95 shadow-sm",
  inverse: "bg-white text-primary hover:bg-white/90 shadow-sm",
  inverseAccent: "bg-white text-accent hover:bg-white/90 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[36px] px-3 text-sm",
  md: "min-h-[44px] px-4 text-[15px]",
  lg: "min-h-[52px] px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading,
    fullWidth,
    className,
    children,
    icon,
    ...rest
  } = props;
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </>
  );

  if ("href" in rest && rest.href !== undefined && !rest.disabled) {
    const { href, disabled: _d, ...anchor } = rest as ButtonAsLink;
    void _d;
    return (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }
  const { href: _h, ...button } = rest as ButtonAsButton & { href?: string };
  void _h;
  return (
    <button type="button" className={classes} disabled={loading || button.disabled} {...button}>
      {content}
    </button>
  );
}

/** Square icon-only button (44px touch target). */
export function IconButton({
  className,
  label,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-lg text-heading hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
