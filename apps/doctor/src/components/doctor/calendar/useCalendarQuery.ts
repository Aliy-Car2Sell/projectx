"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toDate, toIsoDate } from "@projectx/utils";
import { today } from "@projectx/utils/dates";
import { calendarViews, type CalendarView } from "./calendar";

/**
 * Which view is open and which day it is anchored to, kept in the URL (`?view=week&date=2026-09-29`)
 * so a view can be linked to and the back button steps through the navigation.
 * The list is the default and needs no params; `date` is left out while it is today.
 */
export function useCalendarQuery(): { view: CalendarView; date: string; go: (next: { view?: CalendarView; date?: string }) => void } {
  const sp = useSearchParams();
  const v = sp.get("view");
  const d = sp.get("date");
  const view = (calendarViews as string[]).includes(v ?? "") ? (v as CalendarView) : "list";
  // A date that does not exist (2026-02-31) would silently roll over into the next month.
  const date = d && /^\d{4}-\d{2}-\d{2}$/.test(d) && toIsoDate(toDate(d)) === d ? d : today();

  const go = useCallback(
    (next: { view?: CalendarView; date?: string }) => {
      const q = new URLSearchParams(window.location.search);
      const nextView = next.view ?? view;
      const nextDate = next.date ?? date;
      if (nextView === "list") q.delete("view");
      else q.set("view", nextView);
      if (nextView === "list" || nextDate === today()) q.delete("date");
      else q.set("date", nextDate);
      const s = q.toString();
      window.history.pushState(null, "", `${window.location.pathname}${s ? `?${s}` : ""}`);
    },
    [view, date],
  );

  return { view, date, go };
}
