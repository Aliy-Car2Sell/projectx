"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EyeOff, Flag, Star } from "lucide-react";
import type { Review } from "@projectx/types";
import { Badge } from "@projectx/ui/Badge";
import { EmptyState } from "@projectx/ui/EmptyState";
import { Toast } from "@projectx/ui/Toast";
import { ReviewCard } from "@projectx/ui/reviews/ReviewCard";

export function DoctorReviewsList({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("doctor.reviews");
  const [reported, setReported] = useState<Set<string>>(new Set(reviews.filter((r) => r.reportReason).map((r) => r.id)));
  const [toast, setToast] = useState<string | null>(null);

  if (reviews.length === 0) {
    return <EmptyState icon={<Star className="h-7 w-7" />} title={t("noReviews")} description={t("noReviewsDesc")} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r}>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2">
            <div className="flex gap-2">
              {r.isHidden && (
                <Badge tone="neutral">
                  <EyeOff className="h-3 w-3" /> {t("hiddenByAdmin")}
                </Badge>
              )}
              {reported.has(r.id) && !r.isHidden && (
                <Badge tone="warning">
                  <Flag className="h-3 w-3" /> {t("reported")}
                </Badge>
              )}
            </div>
            {!reported.has(r.id) && !r.isHidden && (
              <button
                type="button"
                onClick={() => {
                  setReported((s) => new Set(s).add(r.id));
                  setToast(t("reportSent"));
                  setTimeout(() => setToast(null), 2500);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger min-h-[32px]"
              >
                <Flag className="h-3.5 w-3.5" /> {t("report")}
              </button>
            )}
          </div>
        </ReviewCard>
      ))}
      <Toast message={toast} />
    </div>
  );
}
