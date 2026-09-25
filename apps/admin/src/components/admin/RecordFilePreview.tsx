"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, FileText, Image as ImageIcon } from "lucide-react";
import type { MedicalRecord } from "@projectx/types";
import { mockFileUrl } from "@projectx/mock/files";
import { cn } from "@projectx/utils";
import { EmptyState } from "@projectx/ui/EmptyState";
import { FilePreviewModal, type PreviewFile } from "@projectx/ui/FilePreviewModal";

/** The upload's file as a thumbnail button that opens the shared preview modal. */
export function RecordFilePreview({ record }: { record: MedicalRecord }) {
  const t = useTranslations("admin.records");
  const tc = useTranslations("common");
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  if (!record.fileName) return <EmptyState compact icon={<FileText className="h-7 w-7" />} title={t("noFile")} />;
  const isImage = record.fileType === "image";
  const file: PreviewFile = { name: record.fileName, type: isImage ? "image" : "pdf", url: mockFileUrl(isImage ? "image" : "pdf") };
  return (
    <>
      <button
        type="button"
        onClick={() => setPreview(file)}
        className={cn("flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left hover:border-primary", isImage && "sm:w-auto")}
      >
        {isImage ? (
          <img src={file.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
            <FileText className="h-5 w-5" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-heading">{file.name}</span>
          <span className="block text-xs text-muted">{isImage ? t("fileImage") : t("filePdf")}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-text">
          {isImage ? <ImageIcon className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {tc("view")}
        </span>
      </button>
      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </>
  );
}
