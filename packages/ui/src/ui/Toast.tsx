"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export type ToastTone = "neutral" | "success" | "danger";

/** Bottom-centered transient message (above the mobile bottom navigation). */
export function Toast({ message, tone = "neutral" }: { message: string | null; tone?: ToastTone }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex max-w-[calc(100vw-40px)] items-center gap-2.5 rounded-pill bg-neutral-900 py-3 pl-4 pr-5 text-sm font-medium text-white shadow-lg animate-enter"
    >
      {tone === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" />}
      {tone === "danger" && <AlertCircle className="h-5 w-5 shrink-0 text-danger-500" />}
      {message}
    </div>
  );
}

/** Local toast state with auto-dismiss. Usage: `const { toast, show } = useToast(); ... <Toast message={toast} />`. */
export function useToast(durationMs = 2500) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(
    (message: string) => {
      setToast(message);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), durationMs);
    },
    [durationMs],
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return { toast, show };
}
