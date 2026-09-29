"use client";

import { useSyncExternalStore } from "react";
import { toIsoDate } from "@projectx/utils";

export interface Now {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

let current: Now | null = null;
const read = (): Now => {
  const d = new Date();
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const date = toIsoDate(d);
  // Same minute: hand back the same object so subscribers do not re-render.
  if (!current || current.time !== time || current.date !== date) current = { date, time };
  return current;
};

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
  };
}

/** The wall clock to the minute. `null` on the server and during hydration, so both renders agree. */
export function useNow(): Now | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
