import type { Attendance } from "@/models/Attendance";
import { attendanceDateKey } from "./attendance";

export function dtrAttendanceMap(logs: Attendance[]) {
  const map: Record<string, Attendance[]> = {};
  for (const log of logs) {
    const key = attendanceDateKey(log.createdAt);
    if (key) (map[key] ??= []).push(log);
  }
  return map;
}

export function dtrMonths(from: string, to: string): Date[] {
  if (!from || !to || to < from) return [];
  const [year, month] = from.split("-").map(Number);
  const cursor = new Date(year, month - 1, 1);
  const result: Date[] = [];
  while (attendanceDateKey(cursor).slice(0, 7) <= to.slice(0, 7)) {
    result.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

export function dtrDay(month: Date, day: number, from: string, to: string, map: Record<string, Attendance[]>) {
  const date = new Date(month.getFullYear(), month.getMonth(), day);
  const valid = date.getMonth() === month.getMonth();
  const key = attendanceDateKey(date);
  const logs = valid && key >= from && key <= to ? map[key] ?? [] : [];
  const weekday = date.getDay();
  return {
    valid,
    weekday,
    showWeekend: valid && logs.length === 0 && (weekday === 0 || weekday === 6),
    timeIn: logs.find((log) => log.type === "time-in")?.createdAt,
    breakOut: logs.find((log) => log.type === "break-out")?.createdAt,
    breakIn: logs.find((log) => log.type === "break-in")?.createdAt,
    timeOut: logs.find((log) => log.type === "time-out")?.createdAt,
  };
}
