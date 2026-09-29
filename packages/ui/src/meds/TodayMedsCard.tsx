"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BellRing, Check, Pill } from "lucide-react";
import type { MedicalRecord, MedicationLog } from "@projectx/types";
import { cn } from "@projectx/utils";
import { today } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useNow } from "../session/useNow";
import { dosesFor } from "./medications";
import { useReminderSettings, type ReminderPermission } from "./reminders";
import { useMedications } from "./useMedications";

/**
 * Dashboard: today's doses with an "I took it" checkbox each. Renders nothing when the patient
 * has no scheduled medicine. `serverToday` keeps the first render identical on both sides.
 */
export function TodayMedsCard({ patientId, records, logs: mockLogs, serverToday }: { patientId: string; records: MedicalRecord[]; logs: MedicationLog[]; serverToday: string }) {
  const t = useTranslations("meds");
  const now = useNow();
  const { medications, logs, setTaken } = useMedications(patientId, records, mockLogs);
  const { settings, enable } = useReminderSettings();
  const [blocked, setBlocked] = useState<ReminderPermission | null>(null);

  const date = now?.date ?? serverToday ?? today();
  // Before the clock is known nothing counts as missed yet.
  const doses = dosesFor(medications, logs, date, date, now?.time ?? "00:00");
  if (doses.length === 0) return null;
  const allTaken = doses.every((d) => d.status === "taken");

  return (
    <Card padding="sm" className={cn(allTaken && "border-success/40 bg-success-soft/40")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 whitespace-nowrap text-base font-bold text-heading">
          <Pill className="h-5 w-5 text-primary-text" aria-hidden="true" /> {t("today.title")}
        </h3>
        {allTaken ? (
          <span className="whitespace-nowrap text-sm font-semibold text-green-700">{t("today.allTaken")}</span>
        ) : (
          <span className="text-sm text-muted">{t("today.progress", { taken: doses.filter((d) => d.status === "taken").length, total: doses.length })}</span>
        )}
      </div>

      <ul className="mt-2 divide-y divide-line">
        {doses.map((d) => {
          const taken = d.status === "taken";
          const missed = d.status === "missed";
          return (
            <li key={`${d.medication.id}-${d.time}`}>
              <label
                className={cn(
                  "-mx-2 flex min-h-[52px] cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                  taken ? "bg-success-soft/60" : missed ? "bg-warning-soft/60" : "hover:bg-surface",
                )}
              >
                <input
                  type="checkbox"
                  checked={taken}
                  onChange={(e) => setTaken({ medicationId: d.medication.id, date: d.date, time: d.time }, e.target.checked)}
                  className="peer sr-only"
                  aria-label={t("today.took", { name: d.medication.title, time: d.time })}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
                    taken ? "border-success bg-success text-white" : missed ? "border-warning bg-card" : "border-line bg-card",
                  )}
                >
                  {taken && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block font-semibold leading-tight text-heading", taken && "text-green-800")}>{d.medication.title}</span>
                  {d.medication.description && <span className="block truncate text-sm text-muted">{d.medication.description}</span>}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-heading">{d.time}</span>
                  <span className={cn("block text-xs font-medium", taken ? "text-green-700" : missed ? "text-amber-700" : "text-muted")}>
                    {t(taken ? "today.taken" : missed ? "today.missed" : "today.tookShort")}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Offered once; afterwards the profile's "medicine reminders" toggle is the place to change it. */}
      {!settings.asked && !blocked && (
        <div className="mt-3 border-t border-line pt-3">
          <Button size="sm" variant="secondary" icon={<BellRing className="h-4 w-4" />} onClick={async () => setBlocked(((p) => (p === "granted" ? null : p))(await enable()))}>
            {t("reminder.enable")}
          </Button>
          <p className="mt-1.5 text-xs text-muted">{t("reminder.openOnly")}</p>
        </div>
      )}
      {blocked && <p className="mt-3 border-t border-line pt-3 text-sm text-amber-700">{t(blocked === "unsupported" ? "reminder.unsupported" : "reminder.blocked")}</p>}
    </Card>
  );
}
