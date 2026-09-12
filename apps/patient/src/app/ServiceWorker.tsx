"use client";

import { useEffect } from "react";

/** Registers the offline service worker (production only: it would fight HMR in `next dev`). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      /* offline page is a progressive enhancement; ignore registration failures */
    });
  }, []);
  return null;
}
