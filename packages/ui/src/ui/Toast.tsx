"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Bottom-centered transient message (above the mobile bottom navigation). */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-heading text-white px-4 py-2.5 text-sm shadow-lg">
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
