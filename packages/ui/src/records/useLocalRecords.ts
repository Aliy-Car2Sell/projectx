"use client";

import { useCallback, useMemo } from "react";
import type { MedicalRecord } from "@projectx/types";
import { useDemoState } from "../session/store";

const none: MedicalRecord[] = [];

/**
 * Records as this browser knows them: the mock data with local changes on top. A local record with
 * the id of a mock one replaces it (edit, review decision, delete = status "deleted"); any other is
 * an addition. `patientId` narrows additions to one patient; `null` keeps everyone's (admin queue).
 */
export function useLocalRecords(patientId: string | null, records: MedicalRecord[]) {
  const [local, setLocal] = useDemoState<MedicalRecord[]>("records", none);

  const merged = useMemo(() => {
    const byId = new Map(local.map((r) => [r.id, r]));
    const known = new Set(records.map((r) => r.id));
    const added = local.filter((r) => !known.has(r.id) && (patientId === null || r.patientId === patientId));
    return [...added, ...records.map((r) => byId.get(r.id) ?? r)];
  }, [local, records, patientId]);

  /** Add a record, or replace the one with the same id. */
  const save = useCallback(
    (record: MedicalRecord) => setLocal((prev) => [record, ...prev.filter((r) => r.id !== record.id)]),
    [setLocal],
  );

  return { merged, save };
}
