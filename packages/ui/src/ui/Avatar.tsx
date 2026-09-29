/* eslint-disable @next/next/no-img-element */
import { cn, initials } from "@projectx/utils";

type Size = "xs" | "sm" | "md" | "lg" | "photo" | "xl";

const sizes: Record<Size, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  photo: "h-[72px] w-[72px] text-xl", // a doctor in a list
  xl: "h-24 w-24 text-2xl",
};

/** Without a photo the initials get one of these, always the same for the same name. */
const fallbacks = [
  "bg-primary-100 text-primary-800",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-warning-50 text-warning-700",
  "bg-danger-50 text-danger-700",
  "bg-success-50 text-success-700",
];

function fallbackOf(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return fallbacks[hash % fallbacks.length];
}

export function Avatar({
  src,
  name,
  size = "md",
  shape = "circle",
  className,
  ring,
}: {
  src?: string;
  name: string;
  size?: Size;
  /** `square`: a photo with the card's rounded corners instead of a circle. */
  shape?: "circle" | "square";
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-display font-bold",
        shape === "circle" ? "rounded-pill" : "rounded-lg",
        // A caller that names its own colours gets them (class order in the stylesheet would decide otherwise).
        src ? "bg-neutral-100" : !className?.includes("bg-") && fallbackOf(name),
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
