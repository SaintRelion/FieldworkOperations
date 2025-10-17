// utils/time.ts
export type TimeFormat = "iso" | "firebase" | "24h" | "12h" | "unix";

export interface TimeSnapshot {
  iso: string; // 2025-10-16T13:06:01.123Z
  local: string; // 2025-10-16 21:06:01
  firebase: string; // October 16, 2025 at 9:06:01 PM UTC+8
  unix: number; // 1734399999
  date: Date;
}

/**
 * Returns a centralized, consistent timestamp object
 */
export function getCurrentTime(): TimeSnapshot {
  const date = new Date();
  const tzOffsetMinutes = date.getTimezoneOffset() * -1;
  const offsetHours = Math.floor(tzOffsetMinutes / 60);
  const offsetSign = offsetHours >= 0 ? "+" : "-";

  // 🔹 ISO UTC string
  const iso = date.toISOString();

  // 🔹 Local human-readable string (24-hour clock)
  const local = date
    .toLocaleString("en-CA", { hour12: false })
    .replace(",", "");

  // 🔹 Firebase-style human string
  const firebase =
    date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }) + ` UTC${offsetSign}${Math.abs(offsetHours)}`;

  // 🔹 Unix timestamp
  const unix = Math.floor(date.getTime() / 1000);

  return { iso, local, firebase, unix, date };
}

/**
 * Returns a formatted string in your chosen format
 */
export function formatTime(format: TimeFormat = "firebase"): string {
  const t = getCurrentTime();
  switch (format) {
    case "iso":
      return t.iso;
    case "firebase":
      return t.firebase;
    case "24h":
      return t.local;
    case "12h":
      return t.date.toLocaleString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
    case "unix":
      return String(t.unix);
    default:
      return t.firebase;
  }
}
