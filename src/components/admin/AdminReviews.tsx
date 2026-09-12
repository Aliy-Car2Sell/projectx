"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Flag, MessageSquareWarning, ShieldOff } from "lucide-react";
import type { Review } from "@projectx/types";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Chip } from "@projectx/ui/Chip";
import { EmptyState } from "@projectx/ui/EmptyState";
import { Toast } from "@projectx/ui/Toast";
import { ReviewCard } from "@projectx/ui/reviews/ReviewCard";

type Filter = "all" | "reported" | "hidden";

export function AdminReviews({ reviews: initial, doctorNames }: { reviews: Review[]; doctorNames: Record<string, string> }) {
  const t = useTranslations("admin.reviews");
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<Filter>("reported");
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      reviews.filter((r) => (filter === "all" ? true : filter === "reported" ? Boolean(r.reportReason) : r.isHidden)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reviews, filter],
  );

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2500);
  };
  const patch = (id: string, p: Partial<Review>) => setReviews((all) => all.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const counts = {
    all: reviews.length,
    reported: reviews.filter((r) => r.reportReason).length,
    hidden: reviews.filter((r) => r.isHidden).length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["reported", "hidden", "all"] as Filter[]).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)} className="min-h-[36px]">
            {t(f)} · {counts[f]}
          </Chip>
        ))}
        <span className="ml-auto text-sm text-muted">{t("found", { count: rows.length })}</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<MessageSquareWarning className="h-7 w-7" />} title={t("noReviews")} description={t("noReviewsDesc")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map((r) => (
            <ReviewCard key={r.id} review={r}>
              <div className="mt-2 text-xs text-muted">{t("forDoctor", { name: doctorNames[r.doctorId] ?? r.doctorId })}</div>
              {r.reportReason && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-amber-800">
                  <Flag className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">{t("reportReason")}:</span> {r.reportReason}
                  </span>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {r.isHidden && (
                  <Badge tone="neutral">
                    <EyeOff className="h-3 w-3" /> {t("hidden")}
                  </Badge>
                )}
                <div className="ml-auto flex flex-wrap gap-1">
                  {r.isHidden ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => {
                        patch(r.id, { isHidden: false });
                        show(t("shownToast"));
                      }}
                    >
                      {t("show")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      icon={<EyeOff className="h-4 w-4" />}
                      onClick={() => {
                        patch(r.id, { isHidden: true });
                        show(t("hiddenToast"));
                      }}
                    >
                      {t("hide")}
                    </Button>
                  )}
                  {r.reportReason && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<ShieldOff className="h-4 w-4" />}
                      onClick={() => {
                        patch(r.id, { reportReason: undefined });
                        show(t("dismissedToast"));
                      }}
                    >
                      {t("dismissReport")}
                    </Button>
                  )}
                </div>
              </div>
            </ReviewCard>
          ))}
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}
