import { getTranslations } from "next-intl/server";
import { CalendarCheck, FolderHeart, MapPinned, Stethoscope } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const features = [
    { icon: MapPinned, title: t("features.search.title"), desc: t("features.search.desc") },
    { icon: CalendarCheck, title: t("features.booking.title"), desc: t("features.booking.desc") },
    { icon: FolderHeart, title: t("features.records.title"), desc: t("features.records.desc") },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between px-4 md:px-8 h-16">
          <Logo />
          <div className="flex items-center gap-1 md:gap-2">
            <LanguageSwitcher />
            <Button href="/login" variant="ghost" size="sm" className="max-sm:hidden">
              {t("login")}
            </Button>
            <Button href="/register" size="sm">
              {t("register")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="gradient-primary text-white">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">{t("heroTitle")}</h1>
              <p className="mt-4 text-base md:text-lg text-white/90 max-w-xl">{t("heroSubtitle")}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/login"
                  size="lg"
                  variant="inverse"
                  icon={<Stethoscope className="h-5 w-5" />}
                >
                  {t("findDoctor")}
                </Button>
                <Button href="/login" size="lg" variant="ghost" className="text-white border border-white/50 hover:bg-white/10">
                  {t("login")}
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-72 h-72 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full bg-white/15 flex items-center justify-center">
                  <Stethoscope className="h-24 w-24 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="text-base font-bold text-heading">{f.title}</h3>
                <p className="mt-1 text-sm text-muted">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 md:px-8 pb-12 md:pb-20">
          <div className="gradient-accent rounded-xl p-6 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{t("forDoctors")}</h2>
              <p className="mt-1 text-white/90">{t("forDoctorsDesc")}</p>
            </div>
            <Button href="/register" variant="inverseAccent" className="shrink-0">
              {t("joinAsDoctor")}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        {t("footer", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
