"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { Appointment, DoctorProfile } from "@projectx/types";
import { Button } from "@projectx/ui/Button";
import { EmptyState, ErrorState } from "@projectx/ui/EmptyState";
import { RetryButton } from "@projectx/ui/RetryButton";
import { ListSkeleton } from "@projectx/ui/Skeleton";
import { Toast } from "@projectx/ui/Toast";
import { Tabs } from "@projectx/ui/Tabs";
import type { DemoState } from "@projectx/ui/demo/state";
import { AppointmentCard } from "./AppointmentCard";

export function AppointmentsList({
  appointments,
  doctors,
  state = "normal",
}: {
  appointments: Appointment[];
  doctors: Record<string, DoctorProfile>;
  state?: DemoState;
}) {
  const t = useTranslations("patient.appointments");
  const tc = useTranslations("common");
  const tst = useTranslations("states");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [items, setItems] = useState(appointments);
  const [toast, setToast] = useState<string | null>(null);

  const upcoming = items.filter((a) => a.status === "scheduled").sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = items.filter((a) => a.status !== "scheduled").sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const list = state === "empty" ? [] : tab === "upcoming" ? upcoming : past;

  const cancel = (id: string) => {
    setItems((all) => all.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a)));
    setToast(t("cancelledSuccess"));
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        items={[
          { key: "upcoming", label: t("upcoming"), count: state === "empty" ? 0 : upcoming.length },
          { key: "past", label: t("past"), count: state === "empty" ? 0 : past.length },
        ]}
        value={tab}
        onChange={(k) => setTab(k as "upcoming" | "past")}
      />

      {state === "loading" ? (
        <ListSkeleton rows={3} />
      ) : state === "error" ? (
        <ErrorState title={tst("errorTitle")} description={tst("errorDesc")} action={<RetryButton />} />
      ) : list.length === 0 ? (
        tab === "upcoming" ? (
          <EmptyState icon={<CalendarDays className="h-7 w-7" />} title={t("noUpcoming")} description={t("noUpcomingDesc")} action={<Button href="/patient/doctors">{tc("search")}</Button>} />
        ) : (
          <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title={t("noPast")} description={t("noPastDesc")} />
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((a) => {
            const d = doctors[a.doctorId];
            return d ? <AppointmentCard key={a.id} appointment={a} doctor={d} onCancelled={cancel} /> : null;
          })}
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}
