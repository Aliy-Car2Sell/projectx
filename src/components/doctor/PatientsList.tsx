"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, ChevronRight, Search, Users } from "lucide-react";
import type { DoctorPatient } from "@/lib/mock/patients";
import { ageFromBirthDate } from "@/lib/mock/patients";
import { fmtDate } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { RetryButton } from "@/components/ui/RetryButton";
import { ListSkeleton } from "@/components/ui/Skeleton";
import type { DemoState } from "@/components/demo/state";

/** Doctor's patient list with client-side name/phone search. */
export function PatientsList({ patients, state = "normal" }: { patients: DoctorPatient[]; state?: DemoState }) {
  const t = useTranslations("doctor.patients");
  const tc = useTranslations("common");
  const tst = useTranslations("states");
  const locale = useLocale();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter(({ user }) => `${user.firstName} ${user.lastName} ${user.phone}`.toLowerCase().includes(s));
  }, [patients, q]);

  return (
    <>
      <div className="mb-4">
        <Input placeholder={t("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} type="search" />
      </div>
      {state === "loading" ? (
        <ListSkeleton rows={4} />
      ) : state === "error" ? (
        <ErrorState title={tst("errorTitle")} description={tst("errorDesc")} action={<RetryButton />} />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title={t("noPatients")} description={q ? undefined : t("noPatientsDesc")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map(({ user, nextVisit, lastVisit, hasActive }) => {
            const name = `${user.firstName} ${user.lastName}`;
            const age = ageFromBirthDate(user.birthDate);
            return (
              <Link key={user.id} href={`/doctor/patients/${user.id}`} className="bg-card rounded-xl shadow-card border border-line/60 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <Avatar src={user.avatarUrl} name={name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-heading truncate">{name}</span>
                    {hasActive && (
                      <Badge tone="success" dot>
                        {t("activeBadge")}
                      </Badge>
                    )}
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
