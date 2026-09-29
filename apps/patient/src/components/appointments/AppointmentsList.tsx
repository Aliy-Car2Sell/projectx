"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Appointment, DoctorProfile } from "@projectx/types";
import { Button } from "@projectx/ui/Button";
import { EmptyState, ErrorState } from "@projectx/ui/EmptyState";
import { RetryButton } from "@projectx/ui/RetryButton";
import { ListSkeleton } from "@projectx/ui/Skeleton";
import { Toast } from "@projectx/ui/Toast";
import { Tabs } from "@projectx/ui/Tabs";
import type { DemoState } from "@projectx/ui/demo/state";
import { useLocalAppointments } from "@projectx/ui/session/useLocalAppointments";
import { AppointmentCard } from "./AppointmentCard";

/** "My appointments": the mock ones plus what was booked, paid or cancelled in this browser. */
export function AppointmentsList({
  appointments,
  patientId,
  doctors,
  state = "normal",
}: {
  appointments: Appointment[];
  patientId: string;
  doctors: Record<string, DoctorProfile>;
  state?: DemoState;
}) {
  const t = useTranslations("patient.appointments");
  const tst = useTranslations("states");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const { merged: items, save } = useLocalAppointments(patientId, appointments);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const upcoming = items.filter((a) => a.status === "scheduled").sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = items.filter((a) => a.status !== "scheduled").sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const list = state === "empty" ? [] : tab === "upcoming" ? upcoming : past;

  const cancel = (id: string) => {
    const a = items.find((x) => x.id === id);
    if (a) save({ ...a, status: "cancelled" });
    flash(t("cancelledSuccess"));
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
          <EmptyState illustration="appointments" title={t("noUpcoming")} description={t("noUpcomingDesc")} action={<Button href="/patient/doctors">{t("findDoctor")}</Button>} />
        ) : (
          <EmptyState illustration="appointments" title={t("noPast")} description={t("noPastDesc")} />
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((a) => {
            const d = doctors[a.doctorId];
            return d ? <AppointmentCard
                key={a.id}
                appointment={a}
                doctor={d}
                onCancelled={cancel}
                onPaid={(payment) => {
                  save({ ...a, payment });
                  flash(t("paidSuccess"));
                }}
              /> : null;
          })}
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}
