"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import type { MedicalRecord, MedicationLog } from "@projectx/types";
import { readDemo, writeDemo } from "../session/store";
import { useNow } from "../session/useNow";
import { doseKey, dosesFor } from "./medications";
import { notify, useReminderSettings } from "./reminders";
import { useMedications } from "./useMedications";

const none: string[] = [];

/**
 * Fires "time to take <medicine>" while the app is open (mounted in the patient shell, renders nothing).
 * A dose is announced once: at its minute, or on the next check within the hour if the tab was asleep.
 */
export function MedReminders({ patientId, records, logs: mockLogs, href }: { patientId: string; records: MedicalRecord[]; logs: MedicationLog[]; href: string }) {
  const t = useTranslations("meds");
  const now = useNow();
  const { settings } = useReminderSettings();
  const { medications, logs } = useMedications(patientId, records, mockLogs);

  useEffect(() => {
    if (!now || !settings.enabled) return;
    const key = `med.notified.${now.date}`;
    const sent = new Set(readDemo<string[]>(key, none));
    const hourAgo = `${String(Math.max(0, Number(now.time.slice(0, 2)) - 1)).padStart(2, "0")}${now.time.slice(2)}`;
    const due = dosesFor(medications, logs, now.date, now.date, now.time).filter(
      (d) => d.status !== "taken" && d.time <= now.time && d.time >= hourAgo && !sent.has(doseKey({ medicationId: d.medication.id, date: d.date, time: d.time })),
    );
    if (!due.length) return;
    for (const d of due) {
      const id = doseKey({ medicationId: d.medication.id, date: d.date, time: d.time });
      sent.add(id);
      void notify(t("reminder.title", { name: d.medication.title }), t("reminder.body", { time: d.time }), id, href);
    }
    writeDemo(key, [...sent]);
  }, [now, settings.enabled, medications, logs, t, href]);

  return null;
}
