import { toDate } from "@saintrelion/time-functions";
import type { Attendance } from "@/models/Attendance";

export function attendanceDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function attendanceOutcome(record: Pick<Attendance, "attribute" | "evaluated">) {
  if (record.attribute === "absent") return { label: "Absent", className: "bg-rose-50 text-rose-700" };
  if (record.attribute === "tardy") return { label: "Tardy", className: "bg-amber-50 text-amber-800" };
  if (record.attribute === "excused") return { label: "Excused", className: "bg-blue-50 text-blue-700" };
  return record.evaluated
    ? { label: "Cleared", className: "bg-slate-100 text-slate-700" }
    : { label: "Awaiting review", className: "bg-slate-100 text-slate-500" };
}

export function sessionAttendance(record: Attendance, logs: Attendance[]): Attendance {
  if (!record.evaluated || record.attribute) return record;
  const entryType = record.type === "break-out" ? "time-in" : record.type === "time-out" ? "break-in" : null;
  if (!entryType) return record;
  const entry = logs.find((log) => log.userId === record.userId && log.type === entryType &&
    log.evaluated && attendanceDateKey(log.createdAt) === attendanceDateKey(record.createdAt));
  return entry?.attribute ? { ...record, attribute: entry.attribute } : record;
}
