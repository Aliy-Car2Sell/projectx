import Link from "next/link";
import { useTranslations } from "next-intl";
import { Briefcase, MapPin } from "lucide-react";
import type { DoctorProfile } from "@/types";
import { cn, formatMoney } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";

export function DoctorCard({
  doctor,
  href,
  bookHref,
  highlighted,
  compact,
}: {
  doctor: DoctorProfile;
  href?: string;
  bookHref?: string;
  highlighted?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations();
  const name = `${doctor.firstName} ${doctor.lastName}`;
  const profileHref = href ?? `/patient/doctors/${doctor.id}`;

  return (
    <article
      className={cn(
        "bg-card rounded-xl shadow-card border p-4 flex gap-3 md:gap-4 transition-shadow hover:shadow-md",
        highlighted ? "border-accent ring-2 ring-accent/20" : "border-line/60",
      )}
    >
      <Link href={profileHref} className="shrink-0">
        <Avatar src={doctor.avatarUrl} name={name} size={compact ? "md" : "lg"} />
      </Link>
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={profileHref} className="font-bold text-heading hover:text-primary leading-tight block truncate">
              {name}
            </Link>
            <div className="text-sm text-primary font-medium">{t(`specialties.${doctor.specialty}`)}</div>
          </div>
          {doctor.category !== "none" && (
            <Badge tone="accent" className="max-sm:hidden">
              {t(`categories.${doctor.category}`)}
            </Badge>
          )}
        </div>

        <StarRating value={doctor.rating} showValue count={doctor.reviewCount} countLabel={t("common.reviews", { count: doctor.reviewCount })} />

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> {t("common.years", { count: doctor.experienceYears })}
          </span>
          <span className="inline-flex items-center gap-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{doctor.clinicName}</span>
            {typeof doctor.distanceKm === "number" && (
              <span className="shrink-0">· {t("common.km", { value: doctor.distanceKm })}</span>
            )}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-heading">
            {doctor.price ? t("common.sum", { value: formatMoney(doctor.price) }) : <span className="text-muted font-normal">—</span>}
          </span>
          <Button href={bookHref ?? `/patient/doctors/${doctor.id}/book`} size="sm">
            {t("common.book")}
          </Button>
        </div>
      </div>
    </article>
  );
}
