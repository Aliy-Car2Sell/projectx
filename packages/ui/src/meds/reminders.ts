"use client";

import { useCallback } from "react";
import { useDemoState } from "../session/store";

export interface ReminderSettings {
  /** The patient wants dose reminders (the browser's permission is a separate matter). */
  enabled: boolean;
  /** The dashboard's "turn on reminders" prompt was answered; it is offered only once. */
  asked: boolean;
}
const off: ReminderSettings = { enabled: false, asked: false };

export type ReminderPermission = "granted" | "denied" | "default" | "unsupported";

export function reminderPermission(): ReminderPermission {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}

/** Reminder preference (dashboard prompt and the profile toggle share it). */
export function useReminderSettings() {
  const [settings, setSettings] = useDemoState<ReminderSettings>("med.reminders", off);

  /** Turn reminders on, asking the browser for permission when it has not been decided yet. */
  const enable = useCallback(async (): Promise<ReminderPermission> => {
    let permission = reminderPermission();
    if (permission === "default") permission = await Notification.requestPermission();
    setSettings({ enabled: permission === "granted", asked: true });
    return permission;
  }, [setSettings]);

  const disable = useCallback(() => setSettings({ enabled: false, asked: true }), [setSettings]);

  return { settings, enable, disable };
}

/**
 * Show a local notification. Through the service worker when there is one (installed PWA, production
 * build), so a tap can bring the app to the front; otherwise straight from the page.
 * There is no push server: nothing arrives while the app is closed.
 */
export async function notify(title: string, body: string, tag: string, url: string) {
  if (reminderPermission() !== "granted") return;
  const options = { body, tag, icon: "/icons/icon-192.png", data: { url } };
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  } catch {
    /* a blocked or unsupported notification must never break the page */
  }
}
