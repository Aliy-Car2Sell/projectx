import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { StarRating } from "@projectx/ui/StarRating";

export function RatingSummary({
  average,
  total,
  distribution,
}: {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}) {
  const t = useTranslations("doctor.reviews");
  const max = Math.max(1, ...Object.values(distribution));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-4">
      <div className="rounded-xl gradient-accent text-white p-5 flex flex-col items-center justify-center text-center">
        <div className="text-5xl font-bold leading-none">{average.toFixed(1)}</div>
        <div className="mt-2">
          <StarRating value={average} size="sm" />
        </div>
        <div className="mt-1 text-sm text-white/85">{t("total", { count: total })}</div>
      </div>
      <div className="bg-card rounded-xl shadow-card border border-line/60 p-4 md:p-5">
        <div className="text-sm font-semibold text-heading mb-3">{t("distribution")}</div>
        <ul className="flex flex-col gap-2">
          {([5, 4, 3, 2, 1] as const).map((n) => (
            <li key={n} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 inline-flex items-center gap-1 text-muted">
                {n} <Star className="h-3.5 w-3.5 text-warning" fill="currentColor" strokeWidth={0} />
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-surface overflow-hidden">
                <div className="h-full rounded-full gradient-accent" style={{ width: `${(distribution[n] / max) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-muted tabular-nums">{distribution[n]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
