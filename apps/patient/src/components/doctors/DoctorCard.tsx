import Link from "next/link";
import { useTranslations } from "next-intl";
import { Briefcase, MapPin } from "lucide-react";
import type { DoctorProfile } from "@projectx/types";
import { cn, formatMoney } from "@projectx/utils";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { StarRating } from "@projectx/ui/StarRating";
import { Tooltip } from "@projectx/ui/Tooltip";

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
        "lift flex gap-4 rounded-lg border bg-card p-4 shadow-sm md:p-5",
        highlighted ? "border-primary-300 ring-2 ring-primary-100" : "border-neutral-200/70",
      )}
    >
      <Link href={profileHref} className="shrink-0 self-start rounded-lg">
        <Avatar src={doctor.avatarUrl} name={name} size={compact ? "md" : "photo"} shape="square" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* The name never shares its line with a badge, so it wraps instead of being cut. */}
        <div className="min-w-0">
          <Link href={profileHref} className="block font-display text-lg font-bold leading-tight text-heading [overflow-wrap:anywhere] hover:text-primary-700">
            {name}
          </Link>
          <div className="mt-0.5 text-sm font-medium text-primary-700">{t(`specialties.${doctor.specialty}`)}</div>
        </div>

        <StarRating value={doctor.rating} showValue count={doctor.reviewCount} countLabel={t("common.reviews", { count: doctor.reviewCount })} />

        {doctor.category !== "none" && (
          <span className="inline-flex max-w-full items-center gap-0.5">
            <Badge tone="accent" className="min-w-0">
              <span className="truncate">{t(`qualification.${doctor.category}`)}</span>
            </Badge>
            <Tooltip label={t("hints.label")} text={t("hints.category")} className="shrink-0" />
          </span>
        )}

        <div className="flex flex-col gap-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 shrink-0" /> {t("common.experienceFull", { count: doctor.experienceYears })}
          </span>
          {/* A long clinic name takes a second line instead of being cut. */}
          <span className="flex min-w-0 items-start gap-1.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {doctor.clinicName}
              {typeof doctor.distanceKm === "number" && <span className="whitespace-nowrap"> · {t("common.km", { value: doctor.distanceKm })}</span>}
            </span>
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-3">
          <span className="font-display font-bold text-heading">
            {doctor.price ? t("common.sum", { value: formatMoney(doctor.price) }) : <span className="font-sans font-normal text-muted">—</span>}
          </span>
          <Button href={bookHref ?? `/patient/doctors/${doctor.id}/book`} size="sm">
            {t("common.book")}
          </Button>
        </div>
      </div>
    </article>
  );
}
