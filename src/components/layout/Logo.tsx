import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  compact,
  className,
  light,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
  light?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-bold", className)} aria-label="ProjectX">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm",
          light ? "bg-white/20" : "bg-primary",
        )}
      >
        <HeartPulse className="h-5 w-5" />
      </span>
      {!compact && (
        <span className={cn("text-lg tracking-tight", light ? "text-white" : "text-primary")}>ProjectX</span>
      )}
    </Link>
  );
}
