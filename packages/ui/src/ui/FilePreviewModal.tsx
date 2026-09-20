"use client";

/* eslint-disable @next/next/no-img-element */
import { useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import { buttonClass } from "./Button";
import { Modal } from "./Modal";

export type PreviewFile = { name: string; type: "pdf" | "image"; url: string };

/** Image preview or PDF placeholder with a real download link. */
export function FilePreviewModal({ file, onClose }: { file: PreviewFile | null; onClose: () => void }) {
  const t = useTranslations("files");
  const tc = useTranslations("common");
  return (
    <Modal
      open={Boolean(file)}
      onClose={onClose}
      title={file?.name}
      closeLabel={tc("close")}
      size="lg"
      footer={
        file && (
          <a href={file.url} download={file.name} className={buttonClass("secondary", "md")}>
            <Download className="h-4 w-4" /> {tc("download")}
          </a>
        )
      }
    >
      {file?.type === "image" ? (
        <img src={file.url} alt={file.name} className="max-h-[60vh] w-full rounded-lg bg-surface object-contain" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface px-6 py-12 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft text-primary-text">
            <FileText className="h-10 w-10" />
          </span>
          <div className="font-semibold text-heading break-all">{file?.name}</div>
          <div className="text-sm text-muted">{t("pdfHint")}</div>
        </div>
      )}
    </Modal>
  );
}
