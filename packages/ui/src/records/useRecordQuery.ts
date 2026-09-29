"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { parseRecordQuery, type RecordQuery } from "./groupRecords";

/**
 * The notebook's search and date range live in the URL (`?q=&from=&to=`) so a filtered view can be
 * shared and the back button undoes a range change. Typing replaces the history entry (one entry per
 * search, not per keystroke); picking a range pushes a new one. Other params (`?state=`) and the
 * `#record-` hash are kept.
 */
export function useRecordQuery(): {
  query: RecordQuery;
  setSearch: (q: string) => void;
  setRange: (from: string, to: string) => void;
  clear: () => void;
} {
  const sp = useSearchParams();
  const query = useMemo(() => parseRecordQuery((k) => sp.get(k)), [sp]);

  const write = useCallback((patch: Partial<RecordQuery>, mode: "push" | "replace") => {
    const next = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    const url = `${window.location.pathname}${s ? `?${s}` : ""}${window.location.hash}`;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, []);

  return {
    query,
    setSearch: useCallback((q: string) => write({ q }, "replace"), [write]),
    setRange: useCallback((from: string, to: string) => write({ from, to }, "push"), [write]),
    clear: useCallback(() => write({ q: "", from: "", to: "" }, "push"), [write]),
  };
}
