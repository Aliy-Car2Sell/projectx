/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | boolean | number | bigint | null | undefined>): string {
  return classes.filter((c) => typeof c === "string" && c.length > 0).join(" ");
}

/** Get initials from a full name, e.g. "Aziz Karimov" -> "AK". */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Format YYYY-MM-DD + HH:mm into a Date. */
export function toDate(date: string, time = "00:00"): Date {
  return new Date(`${date}T${time}:00`);
}

/** Local YYYY-MM-DD for a Date (avoids UTC shift of toISOString). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns ISO date string (YYYY-MM-DD) offset by `days` from today. */
export function isoDateFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** Hours remaining until the given date/time; negative if in the past. */
export function hoursUntil(date: string, time: string): number {
  return (toDate(date, time).getTime() - Date.now()) / 36e5;
}

/** Weekday key (mon..sun) for a YYYY-MM-DD string. */
export function weekdayKey(date: string): "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" {
  const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  return keys[new Date(`${date}T00:00:00`).getDay()];
}

/** Format UZS amount with spaces: 250000 -> "250 000". */
export function formatMoney(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function isToday(date: string): boolean {
  return date === toIsoDate(new Date());
}

export function isSameDay(iso: string, offsetDays: number): boolean {
  return iso.slice(0, 10) === isoDateFromNow(offsetDays);
}
