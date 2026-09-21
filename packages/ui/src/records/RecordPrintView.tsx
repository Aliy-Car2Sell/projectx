"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Printer } from "lucide-react";
import type { MedicalRecord, User } from "@projectx/types";
import { fmtDate, fmtMonthYear } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { RecordCover } from "./RecordCover";
import { RecordEntry } from "./RecordEntry";
import { RecordSheet } from "./RecordSheet";
import { groupByMonth, type PrintOptions } from "./groupRecords";

/**
 * The record laid out for paper (styles/print.css): just the sheet, every entry open.
 * On screen it keeps one thin bar (back / print again) that never prints; with `options.auto`
 * the browser's print dialog opens by itself, where "Save as PDF" is the PDF export.
 */
export function RecordPrintView({
  patient,
  cover,
  entries,
  options,
  printedOn,
  backHref,
}: {
  patient: User;
  cover: MedicalRecord[];
  entries: MedicalRecord[];
  options: PrintOptions;
  printedOn: string; // YYYY-MM-DD, from the server so both renders agree
  backHref: string;
}) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const locale = useLocale();
  const name = `${patient.lastName} ${patient.firstName}`;
  const date = fmtDate(locale, tc, printedOn);

  useEffect(() => {
    if (!options.auto) return;
    // Let thumbnails load first, otherwise they print as empty boxes.
    const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)));
    let cancelled = false;
    Promise.all(pending).then(() => !cancelled && window.print());
    return () => {
      cancelled = true;
    };
  }, [options.auto]);

  const meta = [
    t("print.printedOn", { date }),
    options.recordId ? t("print.singleEntry") : t(`print.periods.${options.period}`),
    t(`print.modes.${options.mode}`),
  ];

  return (
    <div className="record-print-page min-h-dvh bg-surface px-4 py-4 md:py-8">
      <div className="record-noprint mx-auto mb-3 flex w-full max-w-[800px] items-center justify-between gap-2">
        <Link href={backHref} className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-muted hover:text-primary-text">
          <ArrowLeft className="h-4 w-4" /> {t("print.back")}
        </Link>
        <Button size="sm" onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
          {t("print.print")}
        </Button>
      </div>

      <div className="record-running-head" aria-hidden="true">
        <span>{name}</span>
        <span>{date}</span>
      </div>

      <RecordSheet>
        <table className="record-print-table">
          <thead>
            <tr>
              <td />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <main>
                  <p className="mb-3 text-xs text-muted">{meta.join(" · ")}</p>
                  <RecordCover patient={patient} records={cover} />
                  {entries.length === 0 ? (
                    <p className="py-10 text-center text-muted">{t("print.nothing")}</p>
                  ) : (
                    groupByMonth(entries).map((g) => (
                      <section key={g.key}>
                        <h3 className="record-month mt-6 mb-1 text-xs font-bold uppercase tracking-[0.1em] text-muted">{fmtMonthYear(tc, g.key)}</h3>
                        <div className="divide-y divide-line">
                          {g.items.map((r) => (
                            <RecordEntry key={r.id} record={r} viewer={options.mode === "doctor" ? "doctor" : "patient"} printing />
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </main>
              </td>
            </tr>
          </tbody>
        </table>
      </RecordSheet>
    </div>
  );
}
