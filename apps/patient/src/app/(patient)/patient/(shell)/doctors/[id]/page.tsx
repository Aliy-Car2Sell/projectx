import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { appUrl } from "@projectx/utils/urls";
import { getTranslations } from "next-intl/server";
import { Award, Briefcase, CalendarCheck, Clock, MapPin, MessageCircle, MessagesSquare, Phone, Users, Wallet } from "lucide-react";
import { getDoctorById } from "@projectx/mock/doctors";
import { getDoctorReviews } from "@projectx/mock/reviews";
import { chatHrefFor } from "@projectx/mock/chats";
import { cn, formatMoney } from "@projectx/utils";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Card, StatCard } from "@projectx/ui/Card";
import { EmptyState } from "@projectx/ui/EmptyState";
import { BackLink, SectionHeader } from "@projectx/ui/PageHeader";
import { StarRating } from "@projectx/ui/StarRating";
import { Tooltip } from "@projectx/ui/Tooltip";
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
  const tq = await getTranslations("qualification");
  const tcity = await getTranslations("cities");
  const th = await getTranslations("hints");
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

  const bookHref = `/patient/doctors/${doctor.id}/book`;
  const price = doctor.price ? tc("sum", { value: formatMoney(doctor.price) }) : null;

  return (
    <>
      <BackLink href={back.href} label={back.label} className="mb-3" />

      {/* Hero band */}
      <section className="relative overflow-hidden rounded-xl border border-primary-100 bg-card shadow-sm">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-100 to-transparent md:h-28" />
        <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-7 md:p-8">
          <Avatar src={doctor.avatarUrl} name={name} size="xl" shape="square" ring className="md:h-32 md:w-32" />
          <div className="min-w-0 flex-1">
            <h1 className="text-h2 text-primary-900 [overflow-wrap:anywhere] md:text-h1">{name}</h1>
            <div className="mt-1 text-base font-semibold text-primary-700 md:text-lg">{ts(doctor.specialty)}</div>
            <div className="mt-2.5">
              <StarRating value={doctor.rating} showValue count={doctor.reviewCount} countLabel={tc("reviews", { count: doctor.reviewCount })} size="sm" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {doctor.category !== "none" && (
                <span className="flex min-w-0 max-w-full items-center gap-0.5">
                  <Badge tone="accent" className="min-w-0">
                    <Award className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{tq(doctor.category)}</span>
                  </Badge>
                  <Tooltip label={th("label")} text={th("category")} className="shrink-0" />
                </span>
              )}
              <Badge tone="primary">
                <MapPin className="h-3.5 w-3.5" /> {tcity(doctor.city)}
              </Badge>
              <Badge tone="neutral">
                <Clock className="h-3.5 w-3.5" /> {t("slotDuration")}: {tc("min", { count: doctor.slotDurationMin })}
              </Badge>
              <Badge tone="neutral">
                <Users className="h-3.5 w-3.5" /> {t("patients")}: {doctor.reviewCount * 7}+
              </Badge>
            </div>
          </div>
          <div className="hidden shrink-0 flex-col gap-2 md:flex">
            <Button href={bookHref} size="lg" icon={<CalendarCheck />}>
              {t("book")}
            </Button>
            <div className="flex gap-2">
              <Button href={`tel:${tel}`} variant="secondary" icon={<Phone />} className="flex-1">
                {t("call")}
              </Button>
              <Button href={chatHref} variant="secondary" icon={<MessageCircle />} className="flex-1">
                {tc("messages")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience, reviews, price */}
      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard compact label={t("experience")} value={tc("years", { count: doctor.experienceYears })} icon={<Briefcase />} />
        <StatCard compact label={t("reviewsStat")} value={doctor.reviewCount} hint={`${t("ratingLabel")}: ${doctor.rating.toFixed(1)}`} icon={<MessagesSquare />} tone="warning" />
        <StatCard label={t("price")} value={price ?? "—"} hint={price ? undefined : t("priceNotSet")} icon={<Wallet />} tone="success" className="max-sm:col-span-2 [&_.text-h1]:text-h2 md:[&_.text-h1]:text-h1" />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          {/* About */}
          <section>
            <SectionHeader>{t("about")}</SectionHeader>
            <Card>
              <p className="text-base leading-relaxed text-neutral-800">{doctor.about}</p>
            </Card>
          </section>

          {/* Reviews */}
          <section>
            <SectionHeader>
              {t("reviews")} <span className="font-sans text-sm font-normal text-muted">({reviews.length})</span>
            </SectionHeader>
            {reviews.length === 0 ? (
              <EmptyState illustration="chat" title={t("noReviews")} description={t("noReviewsDesc")} />
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Booking (sticky on desktop) + workplace */}
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-24">
          <Card accent="primary" className="max-md:hidden">
            <div className="text-sm text-muted">{t("price")}</div>
            <div className="mt-1 font-display text-h2 text-heading">{price ?? <span className="font-sans text-sm font-normal text-muted">{t("priceNotSet")}</span>}</div>
            <Button href={bookHref} size="lg" fullWidth className="mt-4" icon={<CalendarCheck />}>
              {t("book")}
            </Button>
          </Card>
          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-heading">
              <MapPin className="h-5 w-5 text-primary-700" /> {t("workplace")}
            </h3>
            <div className="font-semibold text-heading">{doctor.clinicName}</div>
            <div className="text-sm text-muted">{doctor.address}</div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted">
              <Phone className="h-4 w-4" /> {doctor.phone}
            </div>
            <div className="mt-4">
              <MapView pins={[{ id: doctor.id, lat: doctor.lat, lng: doctor.lng, title: doctor.clinicName, subtitle: doctor.address }]} zoom={14} className="h-48" />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${doctor.lat}&mlon=${doctor.lng}#map=16/${doctor.lat}/${doctor.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-primary-700 hover:underline"
            >
              {t("openMap")} →
            </a>
          </Card>
        </aside>
      </div>

      {/* Mobile sticky CTA (sits above the bottom nav, which guests don't have) */}
      <div className={cn("md:hidden fixed inset-x-0 z-20 flex gap-2 border-t border-line bg-card/85 p-3 backdrop-blur-md safe-bottom", signedIn ? "bottom-14" : "bottom-0")}>
        <Button href={`tel:${tel}`} variant="secondary" size="lg" className="shrink-0 w-[52px] px-0!" aria-label={t("call")}>
          <Phone className="h-5 w-5" />
        </Button>
        <Button href={chatHref} variant="secondary" size="lg" className="shrink-0 w-[52px] px-0!" aria-label={tc("messages")}>
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button href={bookHref} size="lg" fullWidth className="min-w-0 px-3!" icon={<CalendarCheck />}>
          {t("book")}
        </Button>
      </div>
      <div className="h-20 md:hidden" />
    </>
  );
}
