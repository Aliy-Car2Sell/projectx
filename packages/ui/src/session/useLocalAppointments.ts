"use client";

import { useCallback, useMemo } from "react";
import type { Appointment } from "@projectx/types";
import { useDemoState } from "./store";

const none: Appointment[] = [];

/**
 * Appointments as this browser knows them: the mock ones with local changes on top (a booking made
 * here, a payment, a cancellation). A local appointment with a mock one's id replaces it.
 */
export function useLocalAppointments(patientId: string, appointments: Appointment[]) {
  const [local, setLocal] = useDemoState<Appointment[]>("appointments", none);

  const merged = useMemo(() => {
    const byId = new Map(local.map((a) => [a.id, a]));
    const known = new Set(appointments.map((a) => a.id));
    return [...local.filter((a) => !known.has(a.id) && a.patientId === patientId), ...appointments.map((a) => byId.get(a.id) ?? a)];
  }, [local, appointments, patientId]);

  const save = useCallback((a: Appointment) => setLocal((prev) => [a, ...prev.filter((x) => x.id !== a.id)]), [setLocal]);

  return { merged, local, save };
}
