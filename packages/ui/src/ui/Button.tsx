import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@projectx/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "inverse" | "inverseAccent";
type Size = "sm" | "md" | "lg";

const base =
  "press inline-flex items-center justify-center gap-2 rounded-pill font-semibold select-none whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const variants: Record<Variant, string> = {
  primary: "bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-md",
  secondary: "bg-card text-primary-700 border border-primary-200 hover:border-primary-300 hover:bg-primary-50",
  ghost: "bg-transparent text-neutral-800 hover:bg-neutral-900/5",
  danger: "bg-danger-700 text-white shadow-sm hover:bg-danger-700/90",
  accent: "bg-accent-700 text-white shadow-sm hover:bg-accent-600",
  inverse: "bg-white text-primary-700 shadow-sm hover:bg-primary-50",
  inverseAccent: "bg-white text-accent-700 shadow-sm hover:bg-accent-50",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[36px] px-4 text-sm [&>svg]:h-4 [&>svg]:w-4",
  md: "min-h-[44px] px-5 text-[15px] [&>svg]:h-[18px] [&>svg]:w-[18px]",
  lg: "min-h-[52px] px-7 text-base [&>svg]:h-5 [&>svg]:w-5",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  /** Icon after the label (an arrow, a chevron). */
  iconRight?: React.ReactNode;
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

/** Button styling for plain elements (e.g. `<a download>`), same look as <Button>. */
export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading,
    fullWidth,
    className,
    children,
    icon,
    iconRight,
    ...rest
  } = props;
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
  const content = (
    <>
      {loading ? <Loader2 className="animate-spin" /> : icon}
      {children}
      {iconRight}
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
    <button type="button" className={classes} aria-busy={loading || undefined} disabled={loading || button.disabled} {...button}>
      {content}
    </button>
  );
}

/** Round icon-only button (44px touch target). */
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
        "press inline-flex h-11 w-11 items-center justify-center rounded-pill text-neutral-700 hover:bg-neutral-900/5 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
