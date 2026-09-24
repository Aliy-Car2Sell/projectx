"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Paperclip, Save } from "lucide-react";
import type { MedicalRecord, RecordSeverity, RecordType } from "@projectx/types";
import { cn } from "@projectx/utils";
import { today } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { FieldLabel, Input, Textarea } from "../ui/Input";
import { Modal } from "../ui/Modal";
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
  onClose,
  onSave,
}: {
  preset: AddPreset | null;
  patientId: string;
  writer?: RecordWriter;
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
}) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const [type, setType] = useState<RecordType>("analysis");
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPrivate, setPrivate] = useState(false);
  const [severity, setSeverity] = useState<RecordSeverity>("normal");
  const coverLine = preset === "allergy" || preset === "medication";
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
  };
  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={preset !== null}
      onClose={close}
      title={coverLine ? t(`add.${preset}Title`) : t("add.title")}
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
          const base = {
            id: `rec-local-${Date.now()}`,
            patientId,
            type: coverLine ? (preset as RecordType) : type,
            title: title.trim(),
            description: text.trim() || undefined,
            fileName: file?.name,
            fileType: file ? (file.type.startsWith("image/") ? "image" : "pdf") : undefined,
            date,
            isNew: true,
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
        {!coverLine && (
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
        {!coverLine && (
          <>
            <Input label={t("add.date")} type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} required />
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-sm text-heading hover:border-primary">
              <Paperclip className="h-4 w-4 shrink-0 text-primary-text" />
              <span className="min-w-0 flex-1 truncate">{file ? file.name : t("add.file")}</span>
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
