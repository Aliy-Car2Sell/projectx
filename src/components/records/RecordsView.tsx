"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Download,
  Eye,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Info,
  Pill,
  Plus,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  Upload,
  History,
  type LucideIcon,
} from "lucide-react";
import type { MedicalRecord, RecordType } from "@/types";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/dates";
import { NewBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { ListSkeleton } from "@/components/ui/Skeleton";
import type { DemoState } from "@/components/demo/state";

const tabOrder: RecordType[] = ["analysis", "imaging", "history", "allergy", "medication", "summary"];
const tabIcon: Record<RecordType, LucideIcon> = {
  analysis: FlaskConical,
  imaging: ScanLine,
  history: History,
  allergy: ShieldAlert,
  medication: Pill,
  summary: Stethoscope,
};
const fileTypes: RecordType[] = ["analysis", "imaging"];

/**
 * Medical record viewer shared by patient (editable) and doctor (read + add summary).
 */
export function RecordsView({
  records,
  mode = "patient",
  state = "normal",
  onAddSummary,
}: {
  records: MedicalRecord[];
  mode?: "patient" | "doctor";
  state?: DemoState;
  onAddSummary?: () => void;
}) {
  const t = useTranslations("patient.records");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [tab, setTab] = useState<RecordType>("analysis");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const list = state === "empty" ? [] : records.filter((r) => r.type === tab).sort((a, b) => b.date.localeCompare(a.date));
  const counts = Object.fromEntries(tabOrder.map((k) => [k, state === "empty" ? 0 : records.filter((r) => r.type === k).length]));
  const isFileTab = fileTypes.includes(tab);
  const canAdd = mode === "patient" || tab === "summary";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addButton = canAdd ? (
    tab === "summary" && mode === "doctor" ? (
      <Button size="sm" onClick={onAddSummary} icon={<Plus className="h-4 w-4" />}>
        {t("add")}
      </Button>
    ) : isFileTab ? (
      <Button size="sm" onClick={() => setUploadOpen(true)} icon={<Upload className="h-4 w-4" />}>
        {t("upload")}
      </Button>
    ) : tab !== "summary" ? (
      <Button size="sm" onClick={() => setEntryOpen(true)} icon={<Plus className="h-4 w-4" />}>
        {t("add")}
      </Button>
    ) : null
  ) : null;

  const TabIcon = tabIcon[tab];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        items={tabOrder.map((k) => ({ key: k, label: t(`tabs.${k}`), count: counts[k] }))}
        value={tab}
        onChange={(k) => setTab(k as RecordType)}
      />

      <div className="flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 font-bold text-heading">
          <TabIcon className="h-5 w-5 text-primary" /> {t(`tabs.${tab}`)}
        </h2>
        {addButton}
      </div>

      {state === "loading" ? (
        <ListSkeleton rows={3} withAvatar={false} />
      ) : list.length === 0 ? (
        <EmptyState icon={<TabIcon className="h-7 w-7" />} title={t(`empty.${tab}`)} description={mode === "patient" ? t("emptyDesc") : undefined} action={addButton} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((r) => (
            <RecordCard key={r.id} record={r} locale={locale} />
          ))}
        </div>
      )}

      {mode === "patient" && (
        <div className="flex items-start gap-2 text-xs text-muted mt-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{t("accessHint")}</span>
        </div>
      )}

      {/* Upload modal (UI only) */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={t("uploadTitle")}
        closeLabel={tc("close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={() => {
                setUploadOpen(false);
                showToast(t("uploaded"));
              }}
              icon={<Upload className="h-4 w-4" />}
            >
              {tc("upload")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface p-6 text-center cursor-pointer hover:border-primary">
            <Upload className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium text-heading">{t("dropHint")}</span>
            <span className="text-xs text-muted">{t("uploadDesc")}</span>
            <input type="file" className="sr-only" accept=".pdf,image/*" />
            <span className="mt-1 inline-flex min-h-[36px] items-center rounded-lg border border-primary px-3 text-sm font-semibold text-primary">{t("chooseFile")}</span>
          </label>
          <Input label={t("fileTitle")} placeholder={t("fileTitlePlaceholder")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("fileDate")} type="date" />
            <Select label={t("fileTypeLabel")} defaultValue={tab} options={fileTypes.map((k) => ({ value: k, label: t(`tabs.${k}`) }))} />
          </div>
        </div>
      </Modal>

      {/* Text entry modal (history / allergy / medication) */}
      <Modal
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        title={t("addEntryTitle")}
        closeLabel={tc("close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEntryOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={() => {
                setEntryOpen(false);
                showToast(tc("save"));
              }}
            >
              {tc("save")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label={t("entryTitle")} />
          <Textarea label={t("entryDesc")} />
          <Input label={t("fileDate")} type="date" />
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-heading text-white px-4 py-2.5 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function RecordCard({ record, locale }: { record: MedicalRecord; locale: string }) {
  const t = useTranslations("patient.records");
  const tc = useTranslations("common");
  const isFile = Boolean(record.fileName);
  const Icon = record.fileType === "image" ? ImageIcon : isFile ? FileText : tabIcon[record.type];

  return (
    <div className={cn("bg-card rounded-xl shadow-card border border-line/60 p-4 flex gap-3", record.isNew && "border-accent/40")}>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", record.fileType === "image" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary")}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-heading leading-tight flex items-center gap-2 flex-wrap">
              <span className="truncate">{record.title}</span>
              {record.isNew && <NewBadge label={tc("new")} />}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {fmtDate(locale, tc, record.date)}
              {isFile && <> · {record.fileType === "image" ? t("image") : t("pdf")}</>}
              {!isFile && <> · {t("note")}</>}
            </div>
          </div>
          {isFile && (
            <div className="flex shrink-0 -mr-1">
              <button type="button" aria-label={tc("view")} title={tc("view")} className="h-9 w-9 rounded-lg flex items-center justify-center text-muted hover:bg-surface hover:text-primary">
                <Eye className="h-4 w-4" />
              </button>
              <button type="button" aria-label={tc("download")} title={tc("download")} className="h-9 w-9 rounded-lg flex items-center justify-center text-muted hover:bg-surface hover:text-primary">
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {record.description && <p className="mt-1.5 text-sm text-heading/90">{record.description}</p>}
        <div className="mt-1.5 text-xs text-muted">
          {record.authorRole === "doctor" ? t("byDoctor", { name: record.authorName ?? "" }) : t("byYou")}
        </div>
      </div>
    </div>
  );
}
