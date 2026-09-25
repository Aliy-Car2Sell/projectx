"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronRight, NotebookPen, Plus, Printer, Stethoscope, X } from "lucide-react";
import type { DoctorProfile, MedicalRecord, User } from "@projectx/types";
import { cn } from "@projectx/utils";
import { chatHrefFor } from "@projectx/mock/chats";
import { fmtMonthYear } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { ErrorState } from "../ui/EmptyState";
import { RetryButton } from "../ui/RetryButton";
import { Skeleton } from "../ui/Skeleton";
import { Toast, useToast } from "../ui/Toast";
import type { DemoState } from "../demo/state";
import { AddRecordSheet, type AddPreset, type RecordWriter } from "./AddRecordSheet";
import { AskDoctorSheet } from "./AskDoctorSheet";
import { PrintDialog } from "./PrintDialog";
import { RecordCover } from "./RecordCover";
import { RecordEntry, recordDomId } from "./RecordEntry";
import { RecordSheet } from "./RecordSheet";
import { byFilter, flaggedCounts, groupByMonth, printQuery, recordSections, timeline, type RecordFilter } from "./groupRecords";

const filters: RecordFilter[] = ["all", ...recordSections];

/** `#record-<id>` in the URL: the entry to open and scroll to (null on the server and without a hash). */
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash;
function useFocusedRecordId(): string | null {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const m = hash.match(/^#record-(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * The medical record as one continuous document ("notebook"): cover, then dated entries newest first,
 * grouped by month. Shared by the patient app (`role="patient"`: may add entries, sees private ones)
 * and the doctor app (`role="doctor"`: may add entries with a severity and write a summary; private
 * and unreviewed entries never reach it).
 */
export function RecordsView({
  patient,
  records,
  role = "patient",
  writer,
  doctors,
  state = "normal",
  onAddSummary,
  printHref,
}: {
  patient: User;
  records: MedicalRecord[];
  role?: "patient" | "doctor";
  /** The doctor writing into this notebook (doctor app only). */
  writer?: RecordWriter;
  /** Patient app: the patient's own doctors, offered by "ask the doctor" on entries no doctor wrote. */
  doctors?: DoctorProfile[];
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
  const [removed, setRemoved] = useState<string[]>([]);
  const [preset, setPreset] = useState<AddPreset | null>(null);
  const [resubmitting, setResubmitting] = useState<MedicalRecord | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [asking, setAsking] = useState<MedicalRecord | null>(null);
  const router = useRouter();
  const focusId = useFocusedRecordId();
  const [handledFocus, setHandledFocus] = useState<string | null>(null);
  const { toast, show } = useToast();
  // A new deep link always lands on "all", otherwise the entry could be hidden behind a chip.
  if (focusId !== handledFocus) {
    setHandledFocus(focusId);
    if (focusId) setFilter("all");
  }

  const all = useMemo(() => {
    const base = state === "empty" ? [] : records;
    // Defence in depth: the doctor app already asks the mock for shared records only.
    return [...added, ...base].filter((r) => !removed.includes(r.id) && (role === "patient" || (!r.private && r.status === "approved")));
  }, [added, records, removed, role, state]);
  const entries = useMemo(() => timeline(all), [all]);
  const shown = useMemo(() => byFilter(entries, filter), [entries, filter]);
  const groups = useMemo(() => groupByMonth(shown), [shown]);
  const flagged = useMemo(() => flaggedCounts(entries), [entries]);

  // Deep link (dashboard banner, notification): bring the opened entry into view once it is rendered.
  useEffect(() => {
    if (!focusId || state !== "normal" || !shown.some((r) => r.id === focusId)) return;
    document.getElementById(recordDomId(focusId))?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [focusId, shown, state]);

  const addButton =
    role === "patient" ? (
      <Button size="sm" onClick={() => setPreset("entry")} icon={<Plus className="h-4 w-4" />}>
        {t("add.button")}
      </Button>
    ) : (
      <>
        {writer && (
          <Button size="sm" variant="secondary" onClick={() => setPreset("entry")} icon={<Plus className="h-4 w-4" />}>
            {t("add.button")}
          </Button>
        )}
        {onAddSummary && (
          <Button size="sm" onClick={onAddSummary} icon={<Stethoscope className="h-4 w-4" />}>
            {t("writeSummary")}
          </Button>
        )}
      </>
    );

  // "Ask the doctor": the author's chat when a doctor wrote the entry, otherwise let the patient pick one.
  const askDoctor = (r: MedicalRecord) => {
    if (r.authorDoctorId) router.push(chatHrefFor("patient", r.authorDoctorId, r.id));
    else setAsking(r);
  };

  const flaggedText = [flagged.urgent > 0 && t("severity.flaggedUrgent", { count: flagged.urgent }), flagged.attention > 0 && t("severity.flaggedAttention", { count: flagged.attention })]
    .filter(Boolean)
    .join(", ");

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
        {/* Three actions for the doctor (print, add, summary) do not fit 375px on one row: let them wrap. */}
        <div className="flex flex-wrap items-center gap-2">
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

            {/* One line for everything the doctor flagged; tapping it narrows the notebook to those entries. */}
            {flaggedText && (
              <button
                type="button"
                aria-pressed={filter === "flagged"}
                onClick={() => setFilter(filter === "flagged" ? "all" : "flagged")}
                className={cn(
                  "record-noprint mt-3 flex w-full min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors",
                  flagged.urgent > 0 ? "border-danger/40 bg-danger-soft/60 text-red-700 hover:bg-danger-soft" : "border-warning/50 bg-warning-soft/70 text-amber-700 hover:bg-warning-soft",
                  filter === "flagged" && "ring-2 ring-primary/30",
                )}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  {flaggedText} {t("severity.flaggedSuffix")}
                </span>
                {filter === "flagged" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    {t("severity.clearFlagged")} <X className="h-4 w-4" />
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </button>
            )}

            {entries.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-text">
                  <NotebookPen className="h-7 w-7" />
                </span>
                <h3 className="mt-3 text-base font-bold text-heading">{t("empty.title")}</h3>
                <p className="mt-1 max-w-sm text-muted">{t(role === "patient" ? "empty.patient" : "empty.doctor")}</p>
                {addButton && <div className="mt-4 flex flex-wrap justify-center gap-2">{addButton}</div>}
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
                        defaultOpen={r.id === focusId}
                        onAskDoctor={role === "patient" ? askDoctor : undefined}
                        onResubmit={
                          role === "patient"
                            ? (rec) => {
                                setResubmitting(rec);
                                setPreset("entry");
                              }
                            : undefined
                        }
                        onDelete={
                          role === "patient"
                            ? (rec) => {
                                setRemoved((prev) => [...prev, rec.id]);
                                show(t("status.deleted"));
                              }
                            : undefined
                        }
                        actions={
                          // Entries added in this session exist only in the browser; the print route cannot see them,
                          // and it never prints entries still under review or rejected.
                          printHref && r.status === "approved" && !r.id.startsWith("rec-local-") ? (
                            <a
                              href={printHref + printQuery({ recordId: r.id, mode: role === "doctor" ? "doctor" : "full", auto: true })}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-text hover:bg-primary-soft"
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
        key={resubmitting?.id ?? "new"}
        preset={preset}
        patientId={patient.id}
        writer={writer}
        initial={resubmitting ?? undefined}
        onClose={() => {
          setPreset(null);
          setResubmitting(null);
        }}
        onSave={(r) => {
          // A resubmission replaces the rejected entry; a fresh patient entry goes to the admin first.
          if (resubmitting) setRemoved((prev) => [...prev, resubmitting.id]);
          setAdded((prev) => [r, ...prev]);
          setFilter("all");
          show(t(r.status === "pending" ? "status.submitted" : "add.saved"));
          setResubmitting(null);
        }}
      />
      {printHref && <PrintDialog open={printOpen} onClose={() => setPrintOpen(false)} printHref={printHref} chooseMode={role === "patient"} />}
      {role === "patient" && (
        <AskDoctorSheet
          record={asking}
          doctors={doctors ?? []}
          searchHref="/patient/doctors"
          onPick={(d) => {
            if (asking) router.push(chatHrefFor("patient", d.id, asking.id));
            setAsking(null);
          }}
          onClose={() => setAsking(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
