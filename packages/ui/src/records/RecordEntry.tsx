"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Download, Eye, FileText, FlaskConical, History, Image as ImageIcon, Lock, MessageCircleQuestion, NotebookPen, RotateCcw, ScanLine, Stethoscope, Trash2, type LucideIcon } from "lucide-react";
import type { MedicalRecord, RecordType } from "@projectx/types";
import { cn } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { mockFileUrl } from "@projectx/mock/files";
import { Badge, NewBadge } from "../ui/Badge";
import { FilePreviewModal, type PreviewFile } from "../ui/FilePreviewModal";
import { SeverityMark } from "./SeverityMark";

export const recordIcon: Partial<Record<RecordType, LucideIcon>> = {
  analysis: FlaskConical,
  imaging: ScanLine,
  history: History,
  summary: Stethoscope,
  other: NotebookPen,
};

/** DOM id of an entry, so `/patient/records#record-<id>` can scroll to it. */
export const recordDomId = (id: string) => `record-${id}`;

/**
 * One entry of the notebook: a paragraph, not a card. Date and kind in a narrow left column,
 * text on the right. Tapping the text expands it in place; `printing` renders it fully open and static.
 */
export function RecordEntry({
  record,
  viewer,
  printing,
  defaultOpen,
  actions,
  onAskDoctor,
  onResubmit,
  onDelete,
}: {
  record: MedicalRecord;
  viewer: "patient" | "doctor";
  printing?: boolean;
  /** Start expanded (deep link from the dashboard or a notification). */
  defaultOpen?: boolean;
  /** Extra controls shown in the expanded entry (e.g. "print this entry"). */
  actions?: React.ReactNode;
  /** Patient app: "ask the doctor" about this entry (approved entries only). */
  onAskDoctor?: (record: MedicalRecord) => void;
  /** Patient app, rejected entry: open the form again with the admin's reason / drop the entry. */
  onResubmit?: (record: MedicalRecord) => void;
  onDelete?: (record: MedicalRecord) => void;
}) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [prevDefault, setPrevDefault] = useState(defaultOpen);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  // A deep link arriving after mount (hash change) opens the entry; the reader may still collapse it.
  if (defaultOpen !== prevDefault) {
    setPrevDefault(defaultOpen);
    if (defaultOpen) setOpen(true);
  }
  const expanded = printing || open;
  const Icon = recordIcon[record.type] ?? FileText;
  const isSummary = record.type === "summary";
  const isUrgent = record.severity === "urgent";
  const isPending = record.status === "pending";
  const isRejected = record.status === "rejected";
  const isImage = record.fileType === "image";
  const fileUrl = record.fileName ? mockFileUrl(isImage ? "image" : "pdf") : null;
  const file: PreviewFile | null = fileUrl ? { name: record.fileName ?? record.title, type: isImage ? "image" : "pdf", url: fileUrl } : null;
  const author =
    record.authorRole === "doctor" ? t("byDoctor", { name: record.authorName ?? "" }) : viewer === "patient" ? t("byYou") : t("byPatient");
  const canAsk = Boolean(onAskDoctor) && viewer === "patient" && record.status === "approved";
  const hasActions = Boolean(file || actions || canAsk || (isRejected && (onResubmit || onDelete)));

  const heading = (
    <>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-bold text-heading leading-snug">{record.title}</span>
        {record.severity && !printing && <SeverityMark severity={record.severity} className="md:hidden" />}
        {isPending && <Badge tone="warning">{t("status.pending")}</Badge>}
        {isRejected && <Badge tone="danger">{t("status.rejected")}</Badge>}
        {record.isNew && !printing && !isPending && !isRejected && <NewBadge label={tc("new")} />}
        {record.private && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Lock className="h-3 w-3" /> {t("privateBadge")}
          </span>
        )}
      </span>
      {record.description && <span className={cn("mt-0.5 block text-heading/90 leading-relaxed", !expanded && "line-clamp-2")}>{record.description}</span>}
      {isRejected && record.rejectReason && (
        <span className={cn("mt-1 block text-sm text-red-800", !expanded && "line-clamp-2")}>
          <span className="font-semibold">{t("status.reasonLabel")}: </span>
          {record.rejectReason}
        </span>
      )}
    </>
  );

  return (
    <article
      id={recordDomId(record.id)}
      className={cn(
        "record-entry grid grid-cols-[62px_minmax(0,1fr)] md:grid-cols-[92px_minmax(0,1fr)] gap-x-3 md:gap-x-5 py-4 scroll-mt-44 md:scroll-mt-32",
        (isSummary || isUrgent || isPending || isRejected) && "-mx-2 px-2 md:-mx-4 md:px-4 border-l-[3px]",
        // An urgent mark wins over the summary's blue edge: the colour must say "act now" at a glance.
        isUrgent ? "record-urgent border-l-danger bg-danger-soft/40" : isSummary && "record-summary border-l-primary bg-primary-soft/60",
        // Awaiting the admin: a pale yellow sheet; rejected: red edge on plain paper.
        isPending && "border-l-warning bg-warning-soft/50",
        isRejected && "border-l-danger",
      )}
    >
      <div className="text-sm leading-tight text-muted">
        <div className="font-semibold text-heading">{fmtDate(locale, tc, record.date, "short")}</div>
        <div>{record.date.slice(0, 4)}</div>
        <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs", isSummary ? "text-primary-text" : "text-muted")} role="img" aria-label={t(`types.${record.type}`)} title={t(`types.${record.type}`)}>
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className={printing ? undefined : "max-md:hidden"}>{t(`types.${record.type}`)}</span>
        </div>
        {/* The doctor's mark stays visible while the entry is collapsed: the colour says it before the text does. */}
        {record.severity && (
          <div className={cn("mt-1.5", !printing && "max-md:hidden")}>
            {printing ? <span className="text-xs font-semibold text-heading">{t("severity.printLabel", { label: t(`severity.${record.severity}`) })}</span> : <SeverityMark severity={record.severity} />}
          </div>
        )}
      </div>

      <div className="min-w-0">
        {printing ? (
          <div>{heading}</div>
        ) : (
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="group flex w-full items-start gap-2 text-left">
            <span className="min-w-0 flex-1">{heading}</span>
            <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:text-primary-text", open && "rotate-180")} />
          </button>
        )}

        {record.values && record.values.length > 0 && (
          <table className="mt-2 w-full text-sm">
            <tbody>
              {record.values.map((v) => (
                <tr key={v.name} className="border-t border-line/70 first:border-t-0">
                  <td className="py-1 pr-2 text-heading">{v.name}</td>
                  <td className="py-1 pr-2 font-semibold text-heading whitespace-nowrap">
                    {v.value} {v.unit}
                  </td>
                  <td className="py-1 text-right text-muted whitespace-nowrap">{v.norm && t("norm", { range: v.norm })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {file &&
          (printing ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- print sheet: a plain, small image
                <img src={file.url} alt="" className="record-thumb h-16 w-16 rounded border border-line object-cover" />
              ) : (
                <FileText className="h-4 w-4 shrink-0" />
              )}
              <span className="break-all">{file.name}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPreview(file)}
              className={cn(
                "mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-surface text-sm text-heading hover:border-primary hover:text-primary-text",
                isImage ? "p-1 pr-3" : "min-h-[36px] px-2.5",
              )}
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- mock thumbnail from /public
                <img src={file.url} alt="" className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-primary-text" />
              )}
              <span className="truncate">{file.name}</span>
              {isImage ? <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted" /> : <Eye className="h-3.5 w-3.5 shrink-0 text-muted" />}
            </button>
          ))}

        <div className="mt-1.5 text-xs text-muted">{author}</div>

        {open && !printing && hasActions && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {isRejected && onResubmit && (
              <button type="button" onClick={() => onResubmit(record)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-text hover:bg-primary-soft">
                <RotateCcw className="h-4 w-4" /> {t("status.resubmit")}
              </button>
            )}
            {isRejected && onDelete && (
              <button type="button" onClick={() => onDelete(record)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-red-700 hover:bg-danger-soft">
                <Trash2 className="h-4 w-4" /> {tc("delete")}
              </button>
            )}
            {canAsk && (
              <button type="button" onClick={() => onAskDoctor?.(record)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-text hover:bg-primary-soft">
                <MessageCircleQuestion className="h-4 w-4" /> {t("askDoctor.button")}
              </button>
            )}
            {file && (
              <a href={file.url} download={file.name} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-text hover:bg-primary-soft">
                <Download className="h-4 w-4" /> {tc("download")}
              </a>
            )}
            {actions}
          </div>
        )}
      </div>
      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </article>
  );
}
