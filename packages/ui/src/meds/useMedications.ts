"use client";

import { useCallback, useMemo } from "react";
import type { MedicalRecord, MedicationLog, RegularMedication } from "@projectx/types";
import { useDemoState } from "../session/store";
import { useLocalRecords } from "../records/useLocalRecords";
import { doseKey, isRegularMedication } from "./medications";

const noLogs: MedicationLog[] = [];

/**
 * The patient's scheduled medicines and their dose log: mock data plus whatever was added or ticked
 * in this browser. A local log entry for a dose overrides the mock one (unticking stores `takenAt: undefined`).
 */
export function useMedications(patientId: string, records: MedicalRecord[], mockLogs: MedicationLog[]) {
  const { merged } = useLocalRecords(patientId, records);
  const [local, setLocal] = useDemoState<MedicationLog[]>(`med.logs.${patientId}`, noLogs);

  const medications = useMemo<RegularMedication[]>(() => merged.filter(isRegularMedication), [merged]);
  const logs = useMemo(() => {
    const overridden = new Set(local.map(doseKey));
    return [...mockLogs.filter((l) => !overridden.has(doseKey(l))), ...local];
  }, [local, mockLogs]);

  const setTaken = useCallback(
    (dose: { medicationId: string; date: string; time: string }, taken: boolean) => {
      setLocal((prev) => [...prev.filter((l) => doseKey(l) !== doseKey(dose)), { ...dose, takenAt: taken ? new Date().toISOString() : undefined }]);
    },
    [setLocal],
  );

  return { medications, logs, setTaken };
}
