"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { NotebookPen, Plus, Printer, Stethoscope } from "lucide-react";
import type { MedicalRecord, User } from "@projectx/types";
import { fmtMonthYear } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { ErrorState } from "../ui/EmptyState";
import { RetryButton } from "../ui/RetryButton";
import { Skeleton } from "../ui/Skeleton";
import { Toast, useToast } from "../ui/Toast";
import type { DemoState } from "../demo/state";
import { AddRecordSheet, type AddPreset } from "./AddRecordSheet";
import { PrintDialog } from "./PrintDialog";
import { RecordCover } from "./RecordCover";
import { RecordEntry } from "./RecordEntry";
import { RecordSheet } from "./RecordSheet";
import { byFilter, groupByMonth, printQuery, recordSections, timeline, type RecordFilter } from "./groupRecords";

const filters: RecordFilter[] = ["all", ...recordSections];

/**
 * The medical record as one continuous document ("notebook"): cover, then dated entries newest first,
 * grouped by month. Shared by the patient app (`role="patient"`: may add entries, sees private ones)
 * and the doctor app (`role="doctor"`: may write a summary; private entries never reach it).
 */
export function RecordsView({
  patient,
  records,
  role = "patient",
  state = "normal",
  onAddSummary,
  printHref,
}: {
  patient: User;
  records: MedicalRecord[];
  role?: "patient" | "doctor";
  state?: DemoState;
  onAddSummary?: () => void;
  /** This record's print route (e.g. "/patient/records/print"); enables "Print / PDF". */
  printHref?: string;
}) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const tst = useTranslations("states");
  const [filter, setFilter] = useState<RecordFilter>("all");
  const [added, setAdded] = useState<MedicalRecord[]>([]);
  const [preset, setPreset] = useState<AddPreset | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const { toast, show } = useToast();

  const all = useMemo(() => {
    const base = state === "empty" ? [] : records;
    // Defence in depth: the doctor app already asks the mock for shared records only.
    return [...added, ...base].filter((r) => role === "patient" || !r.private);
  }, [added, records, role, state]);
  const entries = useMemo(() => timeline(all), [all]);
  const shown = useMemo(() => byFilter(entries, filter), [entries, filter]);
  const groups = useMemo(() => groupByMonth(shown), [shown]);

  const addButton =
    role === "patient" ? (
      <Button size="sm" onClick={() => setPreset("entry")} icon={<Plus className="h-4 w-4" />}>
        {t("add.button")}
      </Button>
    ) : onAddSummary ? (
      <Button size="sm" onClick={onAddSummary} icon={<Stethoscope className="h-4 w-4" />}>
        {t("writeSummary")}
      </Button>
    ) : null;

  if (state === "error") return <ErrorState title={tst("errorTitle")} description={tst("errorDesc")} action={<RetryButton />} />;

  return (
    <div className="flex flex-col">
      {/* Sticky controls: filter chips scroll sideways on narrow screens, actions stay put */}
      <div className="sticky top-14 md:top-16 z-20 -mx-4 px-4 md:mx-0 md:px-0 py-2 bg-surface/95 backdrop-blur flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 basis-full md:basis-0 gap-1.5 overflow-x-auto scrollbar-none" role="group" aria-label={t("filterLabel")}>
          {filters.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)} className="min-h-[36px] shrink-0">
              {t(`filters.${f}`)}
            </Chip>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {printHref && state === "normal" && (
            <Button size="sm" variant="secondary" onClick={() => setPrintOpen(true)} icon={<Printer className="h-4 w-4" />}>
              {t("print.button")}
            </Button>
          )}
          {addButton}
        </div>
      </div>

      <RecordSheet className="mt-2">
        {state === "loading" ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label={tc("loading")}>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[62px_1fr] gap-3 border-t border-line pt-4">
                <Skeleton className="h-10 w-12" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <RecordCover patient={patient} records={all} onAdd={role === "patient" ? setPreset : undefined} />

            {entries.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <NotebookPen className="h-7 w-7" />
                </span>
                <h3 className="mt-3 text-base font-bold text-heading">{t("empty.title")}</h3>
                <p className="mt-1 max-w-sm text-muted">{t(role === "patient" ? "empty.patient" : "empty.doctor")}</p>
                {addButton && <div className="mt-4">{addButton}</div>}
              </div>
            ) : shown.length === 0 ? (
              <p className="py-10 text-center text-muted">{t("empty.filtered")}</p>
            ) : (
              groups.map((g) => (
                <section key={g.key} aria-label={fmtMonthYear(tc, g.key)}>
                  <h3 className="record-month mt-6 mb-1 text-xs font-bold uppercase tracking-[0.1em] text-muted">{fmtMonthYear(tc, g.key)}</h3>
                  <div className="divide-y divide-line">
                    {g.items.map((r) => (
                      <RecordEntry
                        key={r.id}
                        record={r}
                        viewer={role}
                        actions={
                          // Entries added in this session exist only in the browser; the print route cannot see them.
                          printHref && !r.id.startsWith("rec-local-") ? (
                            <a
                              href={printHref + printQuery({ recordId: r.id, mode: role === "doctor" ? "doctor" : "full", auto: true })}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary hover:bg-primary-soft"
                            >
                              <Printer className="h-4 w-4" /> {t("print.entry")}
                            </a>
                          ) : null
                        }
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </RecordSheet>

      <AddRecordSheet
        preset={preset}
        patientId={patient.id}
        onClose={() => setPreset(null)}
        onSave={(r) => {
          setAdded((prev) => [r, ...prev]);
          setFilter("all");
          show(t("add.saved"));
        }}
      />
      {printHref && <PrintDialog open={printOpen} onClose={() => setPrintOpen(false)} printHref={printHref} chooseMode={role === "patient"} />}
      <Toast message={toast} />
    </div>
  );
}
