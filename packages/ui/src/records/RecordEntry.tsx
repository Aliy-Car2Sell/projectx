"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Download, Eye, FileText, FlaskConical, History, Image as ImageIcon, Lock, NotebookPen, ScanLine, Stethoscope, type LucideIcon } from "lucide-react";
import type { MedicalRecord, RecordType } from "@projectx/types";
import { cn } from "@projectx/utils";
import { fmtDate } from "@projectx/utils/dates";
import { mockFileUrl } from "@projectx/mock/files";
import { NewBadge } from "../ui/Badge";
import { FilePreviewModal, type PreviewFile } from "../ui/FilePreviewModal";

export const recordIcon: Partial<Record<RecordType, LucideIcon>> = {
  analysis: FlaskConical,
  imaging: ScanLine,
  history: History,
  summary: Stethoscope,
  other: NotebookPen,
};

/**
 * One entry of the notebook: a paragraph, not a card. Date and kind in a narrow left column,
 * text on the right. Tapping the text expands it in place; `printing` renders it fully open and static.
 */
export function RecordEntry({
  record,
  viewer,
  printing,
  actions,
}: {
  record: MedicalRecord;
  viewer: "patient" | "doctor";
  printing?: boolean;
  /** Extra controls shown in the expanded entry (e.g. "print this entry"). */
  actions?: React.ReactNode;
}) {
  const t = useTranslations("records");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const expanded = printing || open;
  const Icon = recordIcon[record.type] ?? FileText;
  const isSummary = record.type === "summary";
  const isImage = record.fileType === "image";
  const fileUrl = record.fileName ? mockFileUrl(isImage ? "image" : "pdf") : null;
  const file: PreviewFile | null = fileUrl ? { name: record.fileName ?? record.title, type: isImage ? "image" : "pdf", url: fileUrl } : null;
  const author =
    record.authorRole === "doctor" ? t("byDoctor", { name: record.authorName ?? "" }) : viewer === "patient" ? t("byYou") : t("byPatient");

  const heading = (
    <>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-bold text-heading leading-snug">{record.title}</span>
        {record.isNew && !printing && <NewBadge label={tc("new")} />}
        {record.private && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Lock className="h-3 w-3" /> {t("privateBadge")}
          </span>
        )}
      </span>
      {record.description && <span className={cn("mt-0.5 block text-heading/90 leading-relaxed", !expanded && "line-clamp-2")}>{record.description}</span>}
    </>
  );

  return (
    <article
      className={cn(
        "record-entry grid grid-cols-[62px_minmax(0,1fr)] md:grid-cols-[92px_minmax(0,1fr)] gap-x-3 md:gap-x-5 py-4",
        isSummary && "record-summary -mx-2 px-2 md:-mx-4 md:px-4 border-l-[3px] border-l-primary bg-primary-soft/60",
      )}
    >
      <div className="text-sm leading-tight text-muted">
        <div className="font-semibold text-heading">{fmtDate(locale, tc, record.date, "short")}</div>
        <div>{record.date.slice(0, 4)}</div>
        <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs", isSummary ? "text-primary" : "text-muted")} role="img" aria-label={t(`types.${record.type}`)} title={t(`types.${record.type}`)}>
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className={printing ? undefined : "max-md:hidden"}>{t(`types.${record.type}`)}</span>
        </div>
      </div>

      <div className="min-w-0">
        {printing ? (
          <div>{heading}</div>
        ) : (
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="group flex w-full items-start gap-2 text-left">
            <span className="min-w-0 flex-1">{heading}</span>
            <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:text-primary", open && "rotate-180")} />
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
                "mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-surface text-sm text-heading hover:border-primary hover:text-primary",
                isImage ? "p-1 pr-3" : "min-h-[36px] px-2.5",
              )}
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- mock thumbnail from /public
                <img src={file.url} alt="" className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="truncate">{file.name}</span>
              {isImage ? <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted" /> : <Eye className="h-3.5 w-3.5 shrink-0 text-muted" />}
            </button>
          ))}

        <div className="mt-1.5 text-xs text-muted">{author}</div>

        {open && !printing && (file || actions) && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {file && (
              <a href={file.url} download={file.name} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary hover:bg-primary-soft">
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
