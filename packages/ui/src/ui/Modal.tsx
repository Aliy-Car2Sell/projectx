"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@projectx/utils";
import { IconButton } from "./Button";

/**
 * Responsive dialog: a sheet that rises from the bottom on phones (with a grab handle),
 * a centered modal on md+.
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center md:p-6" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={label}
        className="absolute inset-0 bg-neutral-900/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full bg-card shadow-lg flex flex-col max-h-[92vh] md:max-h-[85vh]",
          "rounded-t-xl md:rounded-xl animate-sheet",
          size === "lg" ? "md:max-w-2xl" : "md:max-w-md",
        )}
      >
        <div className="md:hidden mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-pill bg-neutral-300" />
        <div className="flex items-center justify-between gap-3 pl-5 pr-3 pt-3 pb-2 md:pl-6 md:pr-4 md:pt-5">
          <h2 className="text-h3 text-heading">{title}</h2>
          <IconButton label={label} onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-5 md:px-6 md:pb-6 grow">{children}</div>
        {footer && (
          <div className="border-t border-line px-5 py-4 md:px-6 safe-bottom flex gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}
