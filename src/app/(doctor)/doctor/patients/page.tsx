import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarClock, ChevronRight, Search, Users } from "lucide-react";
import { currentDoctor } from "@/lib/mock/doctors";
import { ageFromBirthDate, getDoctorPatients } from "@/lib/mock/patients";
import { fmtDate } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { DemoStates } from "@/components/demo/DemoStates";
import { readDemoState } from "@/components/demo/state";

export default async function DoctorPatientsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("doctor.patients");
  const tc = await getTranslations("common");
  const tst = await getTranslations("states");
  const locale = await getLocale();
  const state = readDemoState(await searchParams);
  const patients = state === "empty" ? [] : getDoctorPatients(currentDoctor.id);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DemoStates />
      <div className="mb-4">
        <Input placeholder={t("searchPlaceholder")} leftIcon={<Search className="h-4 w-4" />} type="search" />
      </div>
      {state === "loading" ? (
        <ListSkeleton rows={4} />
      ) : state === "error" ? (
        <ErrorState title={tst("errorTitle")} description={tst("errorDesc")} action={<Button variant="secondary">{tc("retry")}</Button>} />
      ) : patients.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title={t("noPatients")} description={t("noPatientsDesc")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patients.map(({ user, nextVisit, lastVisit, hasActive }) => {
            const name = `${user.firstName} ${user.lastName}`;
            const age = ageFromBirthDate(user.birthDate);
            return (
              <Link key={user.id} href={`/doctor/patients/${user.id}`} className="bg-card rounded-xl shadow-card border border-line/60 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <Avatar src={user.avatarUrl} name={name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-heading truncate">{name}</span>
                    {hasActive && <Badge tone="success" dot>{t("activeBadge")}</Badge>}
                  </div>
                  <div className="text-xs text-muted">
                    {age !== undefined && <>{t("age", { count: age })} · </>}
                    {user.phone}
                  </div>
                  <div className="mt-1 text-sm text-heading inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 text-muted" />
                    {nextVisit ? (
                      <>
                        <span className="text-muted">{t("nextVisit")}:</span> {fmtDate(locale, tc, nextVisit.date, "short")} · {nextVisit.time}
                      </>
                    ) : lastVisit ? (
                      <>
                        <span className="text-muted">{t("lastVisit")}:</span> {fmtDate(locale, tc, lastVisit.date, "short")}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
