import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { appUrl } from "@projectx/utils/urls";
import { getTranslations } from "next-intl/server";
import { Award, Briefcase, CalendarCheck, Clock, MapPin, MessageCircle, Phone, Star, Users } from "lucide-react";
import { getDoctorById } from "@projectx/mock/doctors";
import { getDoctorReviews } from "@projectx/mock/reviews";
import { chatHrefFor } from "@projectx/mock/chats";
import { cn, formatMoney } from "@projectx/utils";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { PageHeader, SectionTitle } from "@projectx/ui/PageHeader";
import { StarRating } from "@projectx/ui/StarRating";
import { MapView } from "@projectx/ui/map/MapView";
import { ReviewCard } from "@projectx/ui/reviews/ReviewCard";
import { SESSION_COOKIE } from "@/lib/session";

export default async function DoctorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const doctor = getDoctorById(id);
  if (!doctor || doctor.status !== "approved") notFound();

  const t = await getTranslations("patient.doctorProfile");
  const tc = await getTranslations("common");
  const ts = await getTranslations("specialties");
  const tcat = await getTranslations("categories");
  const tcity = await getTranslations("cities");
  const reviews = getDoctorReviews(doctor.id);
  const name = `${doctor.firstName} ${doctor.lastName}`;
  const tel = doctor.phone.replace(/\s/g, "");
  // Guests can read the profile; booking and chat go through login (proxy.ts) and come back.
  const chatHref = chatHrefFor("patient", doctor.id);
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  // Doctors and admins open this page as a preview; send them back to their own panel.
  const back =
    from === "doctor"
      ? { href: appUrl("doctor", "/doctor/profile"), label: tc("backToPanel") }
      : from === "admin"
        ? { href: appUrl("admin", `/admin/doctors/${doctor.id}`), label: tc("backToPanel") }
        : { href: "/patient/doctors", label: tc("back") };

  return (
    <>
      <PageHeader title={name} subtitle={ts(doctor.specialty)} backHref={back.href} backLabel={back.label} className="mb-3" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          {/* Hero card */}
          <Card>
            <div className="flex gap-4">
              <Avatar src={doctor.avatarUrl} name={name} size="xl" ring />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {doctor.category !== "none" && (
                    <Badge tone="accent">
                      <Award className="h-3 w-3" /> {tcat(doctor.category)}
                    </Badge>
                  )}
                  <Badge tone="primary">{tcity(doctor.city)}</Badge>
                </div>
                <div className="mt-2">
                  <StarRating value={doctor.rating} showValue count={doctor.reviewCount} countLabel={tc("reviews", { count: doctor.reviewCount })} size="sm" />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-surface p-2">
                <div className="text-xs text-muted inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {t("experience")}
                </div>
                <div className="font-bold text-heading">{tc("years", { count: doctor.experienceYears })}</div>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <div className="text-xs text-muted inline-flex items-center gap-1">
                  <Users className="h-3 w-3" /> {t("patients")}
                </div>
                <div className="font-bold text-heading">{doctor.reviewCount * 7}+</div>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <div className="text-xs text-muted inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t("slotDuration")}
                </div>
                <div className="font-bold text-heading">{tc("min", { count: doctor.slotDurationMin })}</div>
              </div>
            </div>

            <div className="mt-4 hidden md:flex gap-2">
              <Button href={`/patient/doctors/${doctor.id}/book`} size="lg" icon={<CalendarCheck className="h-5 w-5" />}>
                {t("book")}
              </Button>
              <Button href={`tel:${tel}`} variant="secondary" size="lg" icon={<Phone className="h-5 w-5" />}>
                {t("call")}
              </Button>
              <Button href={chatHref} variant="ghost" size="lg" icon={<MessageCircle className="h-5 w-5" />}>
                {tc("messages")}
              </Button>
            </div>
          </Card>

          {/* Price */}
          <Card padding="sm" className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted">{t("price")}</div>
            <div className="font-bold text-heading text-lg">
              {doctor.price ? tc("sum", { value: formatMoney(doctor.price) }) : <span className="text-sm text-muted font-normal">{t("priceNotSet")}</span>}
            </div>
          </Card>

          {/* About */}
          <section>
            <SectionTitle>{t("about")}</SectionTitle>
            <Card>
              <p className="text-[15px] md:text-sm leading-relaxed text-heading">{doctor.about}</p>
            </Card>
          </section>

          {/* Reviews */}
          <section>
            <SectionTitle>
              {t("reviews")} <span className="text-muted font-normal text-sm">({reviews.length})</span>
            </SectionTitle>
            {reviews.length === 0 ? (
              <EmptyState icon={<Star className="h-7 w-7" />} title={t("noReviews")} description={t("noReviewsDesc")} />
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Workplace + map */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 self-start">
          <Card>
            <h3 className="font-bold text-heading mb-2 inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {t("workplace")}
            </h3>
            <div className="font-semibold text-heading">{doctor.clinicName}</div>
            <div className="text-sm text-muted">{doctor.address}</div>
            <div className="text-sm text-muted mt-1 inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {doctor.phone}
            </div>
            <div className="mt-3">
              <MapView pins={[{ id: doctor.id, lat: doctor.lat, lng: doctor.lng, title: doctor.clinicName, subtitle: doctor.address }]} zoom={14} className="h-48" />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${doctor.lat}&mlon=${doctor.lng}#map=16/${doctor.lat}/${doctor.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-primary font-medium hover:underline"
            >
              {t("openMap")} →
            </a>
          </Card>
        </aside>
      </div>

      {/* Mobile sticky CTA (sits above the bottom nav, which guests don't have) */}
      <div className={cn("md:hidden fixed inset-x-0 z-20 bg-card border-t border-line p-3 flex gap-2 safe-bottom", signedIn ? "bottom-14" : "bottom-0")}>
        <Button href={`tel:${tel}`} variant="secondary" size="lg" className="shrink-0 w-11 px-0!" aria-label={t("call")}>
          <Phone className="h-5 w-5" />
        </Button>
        <Button href={chatHref} variant="secondary" size="lg" className="shrink-0 w-11 px-0!" aria-label={tc("messages")}>
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button href={`/patient/doctors/${doctor.id}/book`} size="lg" fullWidth className="min-w-0 px-3!" icon={<CalendarCheck className="h-5 w-5" />}>
          {t("book")}
        </Button>
      </div>
      <div className="h-16 md:hidden" />
    </>
  );
}
