"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileDown, Printer } from "lucide-react";
import { cn } from "@projectx/utils";
import { Button } from "../ui/Button";
import { FieldLabel } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { printPeriods, printQuery, recordSections, type PrintMode, type PrintPeriod, type RecordSection } from "./groupRecords";

const modes: PrintMode[] = ["full", "doctor"];

/**
 * "Print / PDF": pick period, sections and mode, then open the print route, which calls window.print().
 * Both buttons do the same thing on purpose: the browser's own dialog offers "Save as PDF".
 * `chooseMode={false}` (doctor app) always prints the doctor's view.
 */
export function PrintDialog({ open, onClose, printHref, chooseMode = true }: { open: boolean; onClose: () => void; printHref: string; chooseMode?: boolean }) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const [period, setPeriod] = useState<PrintPeriod>("all");
  const [sections, setSections] = useState<RecordSection[]>([...recordSections]);
  const [mode, setMode] = useState<PrintMode>("full");

  const go = () => {
    window.open(printHref + printQuery({ period, sections, mode: chooseMode ? mode : "doctor", auto: true }), "_blank", "noopener");
    onClose();
  };
  const option = (active: boolean) =>
    cn("min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors", active ? "border-primary bg-primary-soft text-primary" : "border-line text-heading hover:border-primary");

  return (
    <Modal open={open} onClose={onClose} title={t("print.title")} closeLabel={tc("close")}>
      <div className="flex flex-col gap-5">
        <div>
          <FieldLabel>{t("print.period")}</FieldLabel>
          <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("print.period")}>
            {printPeriods.map((p) => (
              <button key={p} type="button" role="radio" aria-checked={period === p} onClick={() => setPeriod(p)} className={option(period === p)}>
                {t(`print.periods.${p}`)}
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-heading">{t("print.sections")}</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-x-3">
            {recordSections.map((s) => (
              <label key={s} className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={sections.includes(s)}
                  onChange={(e) => setSections((prev) => (e.target.checked ? recordSections.filter((x) => x === s || prev.includes(x)) : prev.filter((x) => x !== s)))}
                  className="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                />
                <span className="text-heading">{t(`filters.${s}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {chooseMode && (
          <div>
            <FieldLabel>{t("print.mode")}</FieldLabel>
            <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("print.mode")}>
              {modes.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={option(mode === m)}>
                  {t(`print.modes.${m}`)}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-sm text-muted">{t(`print.modeHint.${mode}`)}</p>
          </div>
        )}

        <div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={go} disabled={sections.length === 0} icon={<Printer className="h-4 w-4" />}>
              {t("print.print")}
            </Button>
            <Button onClick={go} disabled={sections.length === 0} variant="secondary" icon={<FileDown className="h-4 w-4" />}>
              {t("print.savePdf")}
            </Button>
          </div>
          <p className="mt-2 text-center text-sm text-muted">{t("print.hint")}</p>
        </div>
      </div>
    </Modal>
  );
}
