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

/** Returns ISO date string (YYYY-MM-DD) offset by `days` from today. */
export function isoDateFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Hours remaining until the given date/time; negative if in the past. */
export function hoursUntil(date: string, time: string): number {
  return (toDate(date, time).getTime() - Date.now()) / 36e5;
}
