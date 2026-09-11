"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Eye, FileText, Image as ImageIcon } from "lucide-react";
import type { DoctorDocument } from "@/types";
import { fmtDate } from "@/lib/dates";
import { mockFileUrl } from "@/lib/mock/files";
import { cn } from "@/lib/utils";
import { FilePreviewModal, type PreviewFile } from "@/components/ui/FilePreviewModal";

/** Doctor documents (diploma, certificate, license) with preview and download. */
export function DocumentList({ documents, columns = 1 }: { documents: DoctorDocument[]; columns?: 1 | 2 }) {
  const tc = useTranslations("common");
  const locale = useLocale();
  const [preview, setPreview] = useState<PreviewFile | null>(null);

  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-3", columns === 2 && "sm:grid-cols-2")}>
        {documents.map((doc) => {
          const url = mockFileUrl(doc.fileType);
          return (
            <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", doc.fileType === "image" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary")}>
                {doc.fileType === "image" ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-heading">{tc(`docType.${doc.type}`)}</div>
                <div className="text-xs text-muted truncate">
                  {doc.fileName} · {fmtDate(locale, tc, doc.uploadedAt, "short")}
                </div>
              </div>
              <div className="flex shrink-0 -mr-1">
                <button
                  type="button"
                  aria-label={tc("view")}
                  title={tc("view")}
                  onClick={() => setPreview({ name: doc.fileName, type: doc.fileType, url })}
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-muted hover:bg-surface hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <a
                  href={url}
                  download={doc.fileName}
                  aria-label={tc("download")}
                  title={tc("download")}
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-muted hover:bg-surface hover:text-primary"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
    </>
  );
}
