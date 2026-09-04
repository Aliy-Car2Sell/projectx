import { useLocale, useTranslations } from "next-intl";
import type { Review } from "@/types";
import { fmtDate } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";

export function ReviewCard({ review, className, children }: { review: Review; className?: string; children?: React.ReactNode }) {
  const locale = useLocale();
  const tc = useTranslations("common");
  return (
    <div className={cn("bg-card rounded-xl shadow-card border border-line/60 p-4", review.isHidden && "opacity-60", className)}>
      <div className="flex items-center gap-3">
        <Avatar name={review.patientName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-heading text-sm truncate">{review.patientName}</div>
          <div className="text-xs text-muted">{fmtDate(locale, tc, review.createdAt.slice(0, 10))}</div>
        </div>
        <StarRating value={review.rating} size="xs" />
      </div>
      <p className="mt-3 text-[15px] md:text-sm text-heading leading-relaxed">{review.text}</p>
      {children}
    </div>
  );
}
