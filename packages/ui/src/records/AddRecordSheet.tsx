"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Paperclip, Save } from "lucide-react";
import type { MedicalRecord, RecordSeverity, RecordType } from "@projectx/types";
import { cn } from "@projectx/utils";
import { today } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { FieldLabel, Input, Textarea } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { dosePresets, normalizeTimes } from "../meds/medications";
import { Chip } from "../ui/Chip";
import { SeverityPicker } from "./SeverityPicker";

const entryTypes: RecordType[] = ["analysis", "imaging", "history", "other"];
export type AddPreset = "entry" | "allergy" | "medication";

/** Who is writing: a patient's entry waits for admin review; a doctor's is approved at once and carries a severity. */
export type RecordWriter = { role: "patient" } | { role: "doctor"; name: string; doctorId: string };

/**
 * "Add to my record" form (bottom sheet on mobile, modal on desktop).
 * `preset` "allergy" / "medication" adds a cover line instead of a dated entry and hides the type chooser.
 */
export function AddRecordSheet({
  preset,
  patientId,
  writer = { role: "patient" },
  initial,
  editing,
  onClose,
  onSave,
}: {
  preset: AddPreset | null;
  patientId: string;
  writer?: RecordWriter;
  /** Resubmitting a rejected entry: the form opens filled in, with the admin's reason on top. Pass a `key` to reset. */
  initial?: MedicalRecord;
  /** `initial` is being edited by its author: the entry keeps its id and status, the caller records the diff. */
  editing?: boolean;
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
}) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const [type, setType] = useState<RecordType>(initial?.type ?? "analysis");
  const [date, setDate] = useState(initial?.date ?? today());
  const [title, setTitle] = useState(initial?.title ?? "");
  const [text, setText] = useState(initial?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [isPrivate, setPrivate] = useState(Boolean(initial?.private));
  const [severity, setSeverity] = useState<RecordSeverity>((editing && initial?.severity) || "normal");
  const [times, setTimes] = useState<string[]>(initial?.schedule?.times ?? ["08:00"]);
  const [otherTime, setOtherTime] = useState("");
  const [startDate, setStartDate] = useState(initial?.schedule?.startDate ?? today());
  const [endDate, setEndDate] = useState(initial?.schedule?.endDate ?? "");
  const coverLine = preset === "allergy" || preset === "medication";
  // A doctor's summary has no chip here: editing one keeps its type.
  const fixedType = Boolean(editing && initial && !entryTypes.includes(initial.type));
  const byDoctor = writer.role === "doctor";
  const formId = "add-record-form";

  const reset = () => {
    setType("analysis");
    setDate(today());
    setTitle("");
    setText("");
    setFile(null);
    setPrivate(false);
    setSeverity("normal");
    setTimes(["08:00"]);
    setOtherTime("");
    setStartDate(today());
    setEndDate("");
  };
  const toggleTime = (time: string) => setTimes((prev) => normalizeTimes(prev.includes(time) ? prev.filter((x) => x !== time) : [...prev, time]));
  const presetTimes: readonly string[] = dosePresets.map((p) => p.time);
  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={preset !== null}
      onClose={close}
      title={coverLine ? t(`add.${preset}Title`) : editing ? t("edit.title") : initial ? t("status.resubmitTitle") : t("add.title")}
      closeLabel={tc("close")}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            {tc("cancel")}
          </Button>
          <Button type="submit" form={formId} icon={<Save className="h-4 w-4" />}>
            {tc("save")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (preset === "medication" && times.length === 0) return;
          if (editing && initial) {
            onSave({
              ...initial,
              type: fixedType ? initial.type : type,
              title: title.trim(),
              description: text.trim() || undefined,
              fileName: file?.name ?? initial.fileName,
              fileType: file ? (file.type.startsWith("image/") ? "image" : "pdf") : initial.fileType,
              date,
              ...(byDoctor ? { severity } : { private: isPrivate || undefined }),
            });
            return close();
          }
          const base = {
            id: `rec-local-${Date.now()}`,
            patientId,
            type: coverLine ? (preset as RecordType) : type,
            title: title.trim(),
            description: text.trim() || undefined,
            fileName: file?.name ?? initial?.fileName,
            fileType: file ? (file.type.startsWith("image/") ? "image" : "pdf") : initial?.fileType,
            date,
            isNew: true,
            schedule: preset === "medication" ? { timesPerDay: times.length, times, startDate, endDate: endDate || undefined } : undefined,
          } as const;
          onSave(
            writer.role === "doctor"
              ? { ...base, authorRole: "doctor", authorName: writer.name, authorDoctorId: writer.doctorId, severity: coverLine ? undefined : severity, status: "approved" }
              : // Cover lines (allergies, regular medication) are the patient's own words and need no review.
                {
                  ...base,
                  authorRole: "patient",
                  private: coverLine ? undefined : isPrivate || undefined,
                  status: coverLine ? "approved" : "pending",
                  submittedAt: new Date().toISOString(),
                },
          );
          close();
        }}
      >
        {initial?.rejectReason && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <div className="font-semibold">{t("status.resubmitHint")}</div>
              <div>{initial.rejectReason}</div>
            </div>
          </div>
        )}
        {!coverLine && !fixedType && (
          <div>
            <FieldLabel>{t("add.type")}</FieldLabel>
            <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("add.type")}>
              {entryTypes.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={type === k}
                  onClick={() => setType(k)}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors",
                    type === k ? "border-primary bg-primary-soft text-primary-text" : "border-line text-heading hover:border-primary",
                  )}
                >
                  {t(`add.types.${k}`)}
                </button>
              ))}
            </div>
          </div>
        )}
        <Input label={t("add.name")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(`add.namePlaceholder.${coverLine ? preset : "entry"}`)} required />
        <Textarea label={t("add.text")} value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        {preset === "medication" && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-heading">{t("add.schedule.label")}</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {dosePresets.map((p) => (
                <Chip key={p.key} active={times.includes(p.time)} onClick={() => toggleTime(p.time)}>
                  {t(`add.schedule.${p.key}`)} {p.time}
                </Chip>
              ))}
              {times
                .filter((x) => !presetTimes.includes(x))
                .map((x) => (
                  <Chip key={x} active onClick={() => toggleTime(x)}>
                    {x} ×
                  </Chip>
                ))}
            </div>
            <div className="flex items-end gap-2">
              <Input label={t("add.schedule.other")} type="time" value={otherTime} onChange={(e) => setOtherTime(e.target.value)} wrapperClassName="flex-1" />
              <Button
                type="button"
                variant="secondary"
                disabled={!otherTime}
                onClick={() => {
                  setTimes((prev) => normalizeTimes([...prev, otherTime]));
                  setOtherTime("");
                }}
              >
                {t("add.schedule.addTime")}
              </Button>
            </div>
            {times.length === 0 ? <p className="text-sm text-danger">{t("add.schedule.required")}</p> : <p className="text-sm text-muted">{t("add.schedule.perDay", { count: times.length })}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Input label={t("add.schedule.start")} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <Input label={t("add.schedule.end")} type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} hint={t("add.schedule.endHint")} />
            </div>
          </fieldset>
        )}
        {!coverLine && (
          <>
            <Input label={t("add.date")} type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} required />
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-sm text-heading hover:border-primary">
              <Paperclip className="h-4 w-4 shrink-0 text-primary-text" />
              <span className="min-w-0 flex-1 truncate">{file ? file.name : (initial?.fileName ?? t("add.file"))}</span>
              <span className="shrink-0 text-xs text-muted">{t("add.fileHint")}</span>
              <input type="file" className="sr-only" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {byDoctor ? (
              <SeverityPicker value={severity} onChange={setSeverity} />
            ) : (
              <label className="flex cursor-pointer items-start gap-2.5">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]" />
                <span>
                  <span className="block font-medium text-heading">{t("add.private")}</span>
                  <span className="block text-sm text-muted">{t("add.privateHint")}</span>
                </span>
              </label>
            )}
          </>
        )}
      </form>
    </Modal>
  );
}
