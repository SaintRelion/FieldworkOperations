import type { AttendanceType } from "@/features/InternDashboardPage/model/types";

export const steps: { type: AttendanceType; label: string }[] = [
  { type: "time-in", label: "Time in" },
  { type: "break-out", label: "Break out" },
  { type: "break-in", label: "Break in" },
  { type: "time-out", label: "Time out" },
];
