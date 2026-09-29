import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarCheck, CalendarClock, Check, ClipboardCheck, MapPin, Search, Stethoscope, UserRoundSearch } from "lucide-react";
import type { SpecialtyKey } from "@projectx/types";
import { appUrl } from "@projectx/utils/urls";
import { Avatar } from "@projectx/ui/Avatar";
import { Button } from "@projectx/ui/Button";
import { Card } from "@projectx/ui/Card";
import { Chip } from "@projectx/ui/Chip";
import { IconBox } from "@projectx/ui/IconBox";
import { Illustration, type IllustrationName } from "@projectx/ui/illustrations";
import { Logo } from "@projectx/ui/layout/Logo";
import { LanguageSwitcher } from "@projectx/ui/layout/LanguageSwitcher";
import { LandingHeader } from "@/components/landing/LandingHeader";

const POPULAR: SpecialtyKey[] = ["cardiologist", "dentist", "pediatrician", "neurologist"];

/** Stand-ins until real partner logos exist: names only, drawn grey. */
const CLINICS = ["Shifo Med", "Nur Klinika", "Salomat Plus", "Tabib Center", "Hayot Medical"];

const STEPS = [
  { key: "find", icon: UserRoundSearch },
  { key: "book", icon: CalendarCheck },
  { key: "visit", icon: ClipboardCheck },
] as const;

const FEATURES: { key: "search" | "booking" | "records" | "chat"; illustration: IllustrationName; href: string }[] = [
  { key: "search", illustration: "findDoctor", href: "/patient/doctors" },
  { key: "booking", illustration: "appointments", href: "/patient/appointments" },
  { key: "records", illustration: "records", href: "/patient/records" },
  { key: "chat", illustration: "chat", href: "/patient/chat" },
];

const section = "mx-auto w-full max-w-[1280px] px-page";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const ts = await getTranslations("specialties");

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader login={t("login")} register={t("register")} />

      <main className="flex-1 animate-enter">
        {/* Hero: on a phone the photo comes right under the title; on desktop it fills the right column. */}
        <section
          className={`${section} grid grid-cols-1 gap-x-16 gap-y-8 pt-6 pb-12 md:pt-10 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[auto_auto] lg:gap-y-6 lg:pb-24`}
        >
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary-100 bg-card py-1 pl-1 pr-3.5 text-sm font-semibold text-primary-700 shadow-sm">
              <IconBox size="sm" className="h-7 w-7">
                <MapPin />
              </IconBox>
              {t("eyebrow")}
            </span>
            <h1 className="mt-5 text-display-sm text-primary-900 md:text-display">
              <span className="block">{t("heroTitle1")}</span>
              <span className="block text-primary-600">{t("heroTitle2")}</span>
            </h1>
          </div>

          <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-primary-100 shadow-lg">
              <Image
                src="/images/hero.webp"
                alt={t("heroImageAlt")}
                fill
                preload
                sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* On a phone the two cards sit on the photo's lower edge; on desktop they float over its corners. */}
            <div className="relative z-10 -mt-14 flex flex-col gap-3 px-3 lg:contents">
              <div className="flex max-w-[300px] items-start gap-3 self-start rounded-lg bg-card p-3.5 shadow-lg lg:absolute lg:-bottom-7 lg:-left-8">
                <Avatar name={t("float.chatName")} size="sm" className="bg-primary-100 text-primary-800" />
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-bold text-heading">{t("float.chatName")}</span>
                    <span className="text-caption text-neutral-500">{t("float.chatTime")}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{t("float.chatText")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end rounded-lg bg-card p-3.5 pr-5 shadow-lg lg:absolute lg:-right-5 lg:bottom-28">
                <IconBox size="lg">
                  <CalendarClock />
                </IconBox>
                <div>
                  <div className="text-caption font-medium text-neutral-500">{t("float.apptLabel")}</div>
                  <div className="text-sm font-bold text-heading">
                    {t("float.apptTime")} · {ts("cardiologist")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="max-w-xl text-lg text-muted">{t("heroSubtitle")}</p>

            <form
              action="/patient/doctors"
              role="search"
              className="mt-7 flex max-w-xl flex-col gap-2 rounded-xl border border-neutral-200/70 bg-card p-2 shadow-md transition-shadow focus-within:border-primary-300 focus-within:shadow-lg sm:flex-row sm:items-center sm:rounded-pill"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 pl-4">
                <Search className="h-5 w-5 shrink-0 text-primary-700" />
                <input
                  type="search"
                  name="q"
                  aria-label={t("searchLabel")}
                  placeholder={t("searchPlaceholder")}
                  autoComplete="off"
                  className="min-h-[52px] w-full min-w-0 bg-transparent text-base text-heading placeholder:text-neutral-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
              </label>
              <Button type="submit" size="lg" className="sm:min-h-[52px]">
                {t("searchButton")}
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-medium text-muted">{t("popular")}:</span>
              {POPULAR.map((k) => (
                <Chip key={k} href={`/patient/doctors?specialty=${k}`} className="min-h-[36px] px-3.5">
                  {ts(k)}
                </Chip>
              ))}
            </div>
          </div>
        </section>

        {/* Trust row */}
        <section className={`${section} pb-12 lg:pb-16`}>
          <p className="text-center text-caption font-semibold uppercase tracking-[0.14em] text-neutral-500">{t("trust")}</p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-12">
            {CLINICS.map((name) => (
              <li key={name} className="font-display text-base font-extrabold tracking-tight text-neutral-500 md:text-xl">
                {name}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className={`${section} py-10 lg:py-12`}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 text-primary-900 md:text-h1">{t("how.title")}</h2>
            <p className="mt-2 text-muted md:text-lg">{t("how.subtitle")}</p>
          </div>
          <div className="relative mt-8 md:mt-12">
            <span
              aria-hidden="true"
              className="absolute left-[16.66%] right-[16.66%] top-8 border-t-2 border-dashed border-primary-200 max-md:hidden"
            />
            <span aria-hidden="true" className="absolute bottom-16 left-8 top-8 border-l-2 border-dashed border-primary-200 md:hidden" />
            <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.key} className="flex gap-5 md:flex-col md:items-center md:gap-0 md:text-center">
                  <span className="relative h-16 w-16 shrink-0">
                    <span className="flex h-16 w-16 items-center justify-center rounded-pill border border-primary-100 bg-card text-primary-700 shadow-md ring-8 ring-surface">
                      <s.icon className="h-7 w-7" />
                    </span>
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-pill bg-primary-700 font-display text-xs font-bold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                  </span>
                  <div className="min-w-0 md:mt-6 md:max-w-xs">
                    <h3 className="text-h3">{t(`how.${s.key}.title`)}</h3>
                    <p className="mt-1.5 text-muted">{t(`how.${s.key}.desc`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What's inside */}
        <section className={`${section} py-10 lg:py-12`}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 text-primary-900 md:text-h1">{t("features.title")}</h2>
            <p className="mt-2 text-muted md:text-lg">{t("features.subtitle")}</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-6">
            {FEATURES.map((f) => (
              <Card key={f.key} href={f.href} className="group flex h-full items-center gap-4 sm:flex-col sm:items-stretch sm:gap-0">
                <div className="flex shrink-0 justify-center rounded-md bg-neutral-50 max-sm:w-24 sm:-mx-1 sm:py-3">
                  <Illustration name={f.illustration} width={136} className="h-auto max-sm:w-24" />
                </div>
                <div className="min-w-0">
                  <h3 className="flex items-center justify-between gap-2 text-lg font-bold sm:mt-5 sm:text-h3">
                    {t(`features.${f.key}.title`)}
                    <ArrowRight className="h-5 w-5 shrink-0 text-primary-700 transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="mt-1 text-sm text-muted sm:mt-1.5 sm:text-base">{t(`features.${f.key}.desc`)}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* For doctors */}
        <section className={`${section} py-10 lg:py-16`} data-accent="teal">
          <div className="relative rounded-xl bg-accent-700 px-6 py-8 text-white shadow-lg md:px-12 md:py-12">
            {/* The circles are cut off by a layer of their own, so the text beside them is never clipped. */}
            <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-xl">
              <span className="absolute -right-16 -top-24 h-72 w-72 rounded-pill bg-accent-600" />
              <span className="absolute -bottom-28 right-32 h-56 w-56 rounded-pill bg-accent-500/40 max-md:hidden" />
            </span>
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-pill bg-white/15 py-1 pl-1 pr-3.5 text-sm font-semibold text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-white text-accent-700">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  {t("forDoctorsBadge")}
                </span>
                <h2 className="mt-4 text-h2 text-white md:text-h1">{t("forDoctors")}</h2>
                <p className="mt-3 max-w-xl text-white/90 md:text-lg">{t("forDoctorsDesc")}</p>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {(["schedule", "patients", "chat"] as const).map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-white text-accent-700">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      {t(`forDoctorsPoints.${p}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch xl:pl-10">
                <Button href="/register?role=doctor" variant="inverseAccent" size="lg" iconRight={<ArrowRight />}>
                  {t("joinAsDoctor")}
                </Button>
                <Button
                  href={appUrl("doctor", "/login")}
                  variant="ghost"
                  size="lg"
                  className="border border-white/40 text-white hover:bg-white/10"
                >
                  {t("doctorApp")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-6 border-t border-line bg-card">
        <div className={`${section} grid grid-cols-2 gap-x-6 gap-y-10 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-14`}>
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
            <LanguageSwitcher className="mt-3 -ml-2.5 w-fit" align="left" side="top" />
          </div>
          <FooterColumn
            title={t("footer.patients")}
            links={[
              { href: "/patient/doctors", label: t("findDoctor") },
              { href: "/patient/appointments", label: t("footer.appointments") },
              { href: "/patient/records", label: t("footer.records") },
            ]}
          />
          <FooterColumn
            title={t("footer.doctors")}
            links={[
              { href: "/register?role=doctor", label: t("joinAsDoctor") },
              { href: appUrl("doctor", "/login"), label: t("doctorApp") },
            ]}
          />
          <FooterColumn
            title={t("footer.account")}
            links={[
              { href: "/login", label: t("login") },
              { href: "/register", label: t("register") },
              { href: "/forgot-password", label: t("footer.forgot") },
            ]}
          />
        </div>
        <div className="border-t border-line">
          <p className={`${section} py-5 text-sm text-neutral-500`}>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="font-sans text-sm font-semibold tracking-normal text-heading">{title}</h3>
      <ul className="mt-3 flex flex-col gap-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-[36px] items-center text-sm text-muted transition-colors hover:text-primary-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
