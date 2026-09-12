/* eslint-disable @next/next/no-img-element */
import { cn, initials } from "@projectx/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-xl",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  ring,
}: {
  src?: string;
  name: string;
  size?: Size;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary font-bold",
        sizes[size],
        ring && "ring-2 ring-white shadow-sm",
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
