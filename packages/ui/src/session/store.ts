"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Demo state that outlives a page: there is no backend yet, so whatever the user changes (records
 * added or edited, doses taken, templates, payments…) is kept in this browser's localStorage under
 * `px:<key>`. Each app has its own origin, so the patient's changes never reach the doctor or admin
 * app. "Clear demo data" on the profile page drops every key and the mock data shows again.
 *
 * The server always renders the fallback; the stored value takes over right after hydration.
 */
const PREFIX = "px:";
const listeners = new Set<() => void>();
// Parsed values keyed by their raw JSON, so a snapshot stays referentially stable between reads.
const cache = new Map<string, { raw: string | null; value: unknown }>();
// Stand-in when localStorage is unavailable (private mode, blocked site data): lasts until the page is left.
const memory = new Map<string, string>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Another tab of the same app changed something.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export function readDemo<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return (raw === null ? fallback : hit.value) as T;
  let value: unknown = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw);
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value as T;
}

export function writeDemo<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    memory.set(key, raw);
  }
  emit();
}

/** Drop every demo key of this app ("Clear demo data"). */
export function clearDemoData() {
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX));
    for (const k of keys) window.localStorage.removeItem(k);
  } catch {
    /* nothing stored */
  }
  memory.clear();
  cache.clear();
  emit();
}

/**
 * `useState` backed by localStorage. `fallback` must be a stable value (a module constant), or the
 * server snapshot changes identity on every render.
 */
export function useDemoState<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => readDemo(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readDemo(key, fallback);
      writeDemo(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, set];
}
