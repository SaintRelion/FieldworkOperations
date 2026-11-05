import { useCurrentUser } from "@/shared/hooks/useAuth";
import { useRefreshOnFocus } from "@/shared/hooks/useRefreshOnFocus";
import { useResourceLocked } from "@/shared/lib/useResource";
import type { Attendance } from "@/shared/model/Attendance";
import type { User } from "@/shared/model/User";
import { formatReadableDate, toDate } from "@saintrelion/time-functions";
import { useMemo, useState } from "react";

// ============================================================
// MARK: AttendanceRecord behavior
export function useAttendanceRecordPage() {
  const user = useCurrentUser<User>();
  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState(false);
  const { useList: getAttendance } =
    useResourceLocked<Attendance>("attendance");
  const attendanceQuery = getAttendance({ filters: { userId: user.id } });
  useRefreshOnFocus(attendanceQuery.refetch);
  const attendance = attendanceQuery.data;

  const grouped = useMemo(() => {
    const days = attendance.reduce(
      (result, log) => {
        const date = formatReadableDate(log.createdAt);
        (result[date] ??= []).push(log);
        return result;
      },
      {} as Record<string, Attendance[]>,
    );

    return Object.entries(days)
      .sort(
        ([first], [second]) =>
          (toDate(second)?.getTime() ?? 0) - (toDate(first)?.getTime() ?? 0),
      )
      .map(
        ([date, logs]) =>
          [
            date,
            [...logs].sort(
              (first, second) =>
                (toDate(first.createdAt)?.getTime() ?? 0) -
                (toDate(second.createdAt)?.getTime() ?? 0),
            ),
          ] as [string, Attendance[]],
      );
  }, [attendance]);
  return {
    selectedLog,
    setSelectedLog,
    open,
    setOpen,
    attendanceQuery,
    attendance,
    grouped,
  };
}
