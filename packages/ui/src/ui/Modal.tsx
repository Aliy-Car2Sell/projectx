"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@projectx/utils";
import { IconButton } from "./Button";

/**
 * Responsive dialog: bottom sheet on mobile, centered modal on md+.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeLabel,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  size?: "md" | "lg";
}) {
  const tc = useTranslations("common");
  const label = closeLabel ?? tc("close");
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={label}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full bg-card shadow-xl flex flex-col max-h-[92vh] md:max-h-[85vh]",
          "rounded-t-2xl md:rounded-2xl animate-[sheet-in_.2s_ease-out]",
          size === "lg" ? "md:max-w-2xl" : "md:max-w-md",
        )}
      >
        <div className="md:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 md:px-6 md:pt-5">
          <h2 className="text-lg font-bold text-heading">{title}</h2>
          <IconButton label={label} onClick={onClose} className="-mr-2">
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-4 pb-4 md:px-6 grow">{children}</div>
        {footer && (
          <div className="border-t border-line px-4 py-3 md:px-6 safe-bottom flex gap-2 justify-end">{footer}</div>
        )}
      </div>
      <style>{`@keyframes sheet-in{from{transform:translateY(16px);opacity:.6}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}
