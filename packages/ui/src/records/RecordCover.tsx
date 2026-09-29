"use client";

import { useLocale, useTranslations } from "next-intl";
import type { MedicalRecord, MedicationLog, User } from "@projectx/types";
import { ageFromBirthDate } from "@projectx/mock/patients";
import { isoDateFromNow } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { isRegularMedication } from "../meds/medications";
import { AdherenceDots } from "../meds/AdherenceDots";
import { Tooltip } from "../ui/Tooltip";
import { coverItems } from "./groupRecords";

/**
 * Top of the record: who the patient is, then the two standing lines a doctor must see first
 * (allergies, regular medication). `onAdd` is only passed for the patient; `logs` only for the
 * doctor, who then sees the last 7 days of adherence next to each scheduled medicine.
 */
export function RecordCover({
  patient,
  records,
  onAdd,
  logs,
}: {
  patient: User;
  records: MedicalRecord[];
  onAdd?: (type: "allergy" | "medication") => void;
  logs?: MedicationLog[];
}) {
  const t = useTranslations("records.cover");
  const tc = useTranslations("common");
  const th = useTranslations("hints");
  const locale = useLocale();
  const age = ageFromBirthDate(patient.birthDate);
  // Oldest first; today is still in progress and is not counted.
  const lastWeek = Array.from({ length: 7 }, (_, i) => isoDateFromNow(i - 7));

  const facts: { label: string; value: string }[] = [];
  if (patient.birthDate) facts.push({ label: t("born"), value: fmtDate(locale, tc, patient.birthDate) });
  if (age !== undefined) facts.push({ label: t("age"), value: t("years", { count: age }) });
  if (patient.bloodType) facts.push({ label: t("bloodType"), value: patient.bloodType });
  facts.push({ label: t("phone"), value: patient.phone });

  return (
    <header className="record-cover border-b-2 border-heading/80 pb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("heading")}</div>
        {onAdd && (
          <span className="record-noprint inline-flex items-center gap-0.5 text-sm text-muted">
            {th("whoSeesLabel")} <Tooltip label={th("whoSeesLabel")} text={th("whoSees")} />
          </span>
        )}
      </div>
      <h2 className="mt-1 text-h2 md:text-[28px] text-heading">
        {patient.lastName} {patient.firstName}
      </h2>
      <dl className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(132px,1fr))] gap-x-4 gap-y-2">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="text-xs text-muted">{f.label}</dt>
            <dd className="font-semibold text-heading whitespace-nowrap">{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-col gap-1.5">
        {(["allergy", "medication"] as const).map((type) => {
          const items = coverItems(records, type);
          return (
            <p key={type} className="leading-snug">
              <span className="font-bold text-heading">{t(type)}: </span>
              {items.length === 0 ? (
                <span className="text-muted">{t("none")}</span>
              ) : (
                items.map((r, i) => (
                  <span key={r.id}>
                    {i > 0 && "; "}
                    <span className={type === "allergy" ? "font-semibold text-danger-700" : "text-heading"}>{r.title}</span>
                    {r.description && <span className="text-muted"> ({r.description})</span>}
                    {isRegularMedication(r) && (
                      <>
                        {" "}
                        <span className="whitespace-nowrap text-sm font-medium tabular-nums text-primary-text">{r.schedule.times.join(" · ")}</span>
                        {logs && (
                          <>
                            {" "}
                            <AdherenceDots medication={r} logs={logs} dates={lastWeek} />
                          </>
                        )}
                      </>
                    )}
                  </span>
                ))
              )}
              {onAdd && (
                <>
                  {" "}
                  <button type="button" onClick={() => onAdd(type)} className="record-noprint text-primary-text font-medium hover:underline">
                    + {t("add")}
                  </button>
                </>
              )}
            </p>
          );
        })}
      </div>
    </header>
  );
}
