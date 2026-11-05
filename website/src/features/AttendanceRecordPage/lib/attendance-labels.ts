import type { Attendance } from "@/shared/model/Attendance";

export const labels: Record<Attendance["type"], string> = {
  "time-in": "Time in",
  "break-out": "Break out",
  "break-in": "Break in",
  "time-out": "Time out",
};
