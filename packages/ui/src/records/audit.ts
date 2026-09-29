"use client";

import { useCallback, useMemo } from "react";
import type { MedicalRecord, RecordAuditAction, RecordAuditChange, RecordAuditEntry, UserRole } from "@projectx/types";
import { useDemoState } from "../session/store";

/** Who is acting; a doctor is identified by the DoctorProfile id. */
export interface AuditActor {
  id: string;
  role: UserRole;
  name: string;
}

/** Fields an edit can change, in the order they are listed in the history. */
const editable = ["type", "title", "description", "date", "fileName", "private", "schedule"] as const;

function asText(r: MedicalRecord, field: (typeof editable)[number] | "severity"): string {
  switch (field) {
    case "private":
      return r.private ? "yes" : "no";
    case "schedule":
      return r.schedule ? [r.schedule.times.join(", "), r.schedule.startDate, r.schedule.endDate].filter(Boolean).join(" · ") : "";
    default:
      return r[field] ?? "";
  }
}

/** What an edit changed, severity aside (that is its own history line). */
export function diffRecord(before: MedicalRecord, after: MedicalRecord): RecordAuditChange[] {
  return editable.map((field) => ({ field, from: asText(before, field), to: asText(after, field) })).filter((c) => c.from !== c.to);
}

export function severityChange(before: MedicalRecord, after: MedicalRecord): RecordAuditChange | null {
  const from = before.severity ?? "";
  const to = after.severity ?? "";
  return from === to ? null : { field: "severity", from, to };
}

const none: RecordAuditEntry[] = [];

/** The audit trail: mock history plus what happened in this browser, oldest first. */
export function useRecordAudit(mock: RecordAuditEntry[]) {
  const [local, setLocal] = useDemoState<RecordAuditEntry[]>("audit", none);

  const byRecord = useMemo(() => {
    const map = new Map<string, RecordAuditEntry[]>();
    for (const e of [...mock, ...local]) map.set(e.recordId, [...(map.get(e.recordId) ?? []), e]);
    for (const list of map.values()) list.sort((a, b) => a.at.localeCompare(b.at));
    return map;
  }, [mock, local]);

  const log = useCallback(
    (recordId: string, actor: AuditActor, action: RecordAuditAction, changes?: RecordAuditChange[]) => {
      setLocal((prev) => [
        ...prev,
        {
          id: `audit-local-${Date.now()}-${prev.length}`,
          recordId,
          at: new Date().toISOString(),
          actorId: actor.id,
          actorRole: actor.role,
          actorName: actor.name,
          action,
          changes: changes?.length ? changes : undefined,
        },
      ]);
    },
    [setLocal],
  );

  /** An edit is one "updated" line for the fields and one "severityChanged" line for the mark. */
  const logEdit = useCallback(
    (before: MedicalRecord, after: MedicalRecord, actor: AuditActor) => {
      const changes = diffRecord(before, after);
      if (changes.length) log(after.id, actor, "updated", changes);
      const severity = severityChange(before, after);
      if (severity) log(after.id, actor, "severityChanged", [severity]);
      return changes.length > 0 || severity !== null;
    },
    [log],
  );

  const historyOf = useCallback((recordId: string) => byRecord.get(recordId) ?? none, [byRecord]);

  return { historyOf, log, logEdit };
}
