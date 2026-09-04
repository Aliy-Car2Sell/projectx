/**
 * Locale-aware date formatting based on translated month/weekday names.
 * We deliberately avoid Intl here: browser ICU data for "uz" is incomplete and
 * would differ from the server, causing hydration mismatches.
 */
import { toDate, toIsoDate, weekdayKey } from "./utils";

type T = (key: string) => string;
export type DateStyle = "long" | "weekday" | "short" | "numeric" | "dayMonth";

function parts(date: string) {
  const d = toDate(date.slice(0, 10));
  return { d, day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), wd: weekdayKey(date.slice(0, 10)) };
}

/**
 * Format a YYYY-MM-DD (or ISO) date string.
 * `tc` must be a translator scoped to the "common" namespace.
 */
export function fmtDate(locale: string, tc: T, date: string, style: DateStyle = "long"): string {
  const { day, month, year, wd } = parts(date);
  const m = tc(`months.${month}`);
  const ms = tc(`monthsShort.${month}`);
  const w = tc(`weekdays.${wd}`);
  const two = String(day).padStart(2, "0");
  const mm = String(month + 1).padStart(2, "0");

  switch (style) {
    case "numeric":
      return `${two}.${mm}.${year}`;
    case "short":
      return locale === "uz" ? `${day}-${ms}` : `${day} ${ms}`;
    case "dayMonth":
      return locale === "uz" ? `${day}-${m}` : `${day} ${m}`;
    case "weekday":
      return locale === "uz" ? `${w}, ${day}-${m}` : `${w}, ${day} ${m}`;
    case "long":
    default:
      if (locale === "uz") return `${day}-${m}, ${year}`;
      if (locale === "ru") return `${day} ${m} ${year}`;
      return `${day} ${m} ${year}`;
  }
}

/** "16:30" from an ISO datetime string (local time). */
export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Today's date as YYYY-MM-DD. */
export function today(): string {
  return toIsoDate(new Date());
}
