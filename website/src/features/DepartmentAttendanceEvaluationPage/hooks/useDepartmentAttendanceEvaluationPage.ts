import {
  ABSENCE_RULES,
  getTardinessPenalty,
} from "@/features/DepartmentAttendanceEvaluationPage/lib/attendance-review";
import { useCurrentUser } from "@/shared/hooks/useAuth";
import { attendanceDateKey } from "@/shared/lib/attendance";
import { useResourceLocked } from "@/shared/lib/useResource";
import { sortByCreatedAt } from "@/shared/lib/utils";
import type {
  Attendance,
  CreateAttendance,
  UpdateAttendance,
} from "@/shared/model/Attendance";
import type { InternInfo, UpdateInternInfo } from "@/shared/model/InternInfo";
import type { Settings } from "@/shared/model/Settings";
import type { User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { toDate } from "@saintrelion/time-functions";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// MARK: DepartmentAttendanceEvaluation behavior
export function useDepartmentAttendanceEvaluationPage() {
  const user = useCurrentUser<User>();
  const navigate = useNavigate();

  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  // ============================================================
  // MARK: Data hooks
  const { useList: getUsers } = useResourceLocked<User>("user");
  const { useList: getAttendance, useUpdate: updateAttendance } =
    useResourceLocked<Attendance, CreateAttendance, UpdateAttendance>(
      "attendance",
      { showToast: false },
    );

  const { useList: getInternInfos, useUpdate: updateInternInfo } =
    useResourceLocked<InternInfo, never, UpdateInternInfo>("interninfo", {
      showToast: false,
    });

  const { useList: getSettings } = useResourceLocked<Settings>("settings");

  // ============================================================
  // MARK: Load attendance data
  const users = getUsers({ filters: { department: user.department } }).data;
  const attendance = sortByCreatedAt(getAttendance({}).data, "asc");

  const interns = getInternInfos({}).data;
  const settings = getSettings({
    filters: { department: user.department },
  }).data;
  const departmentSettings = settings[0];

  // ============================================================
  // MARK: Group attendance records
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Attendance[]>> = {};
    attendance.forEach((log) => {
      if (users.some((u) => u.id === log.userId)) {
        const d = toDate(log.createdAt);
        if (!d) return;
        const dateKey = attendanceDateKey(d);
        if (!map[log.userId]) map[log.userId] = {};
        if (!map[log.userId][dateKey]) map[log.userId][dateKey] = [];
        map[log.userId][dateKey].push(log);
      }
    });
    return map;
  }, [attendance, users]);

  // ============================================================
  // MARK: Attendance actions
  const handleMark = async (
    log: Attendance,
    logs: Attendance[],
    attr: "excused" | "tardy" | "absent" | "",
  ) => {
    const actionLabel = attr === "" ? "Verify & Allow" : attr.toUpperCase();
    const isConfirmed = window.confirm(
      `Are you sure you want to mark this session as [${actionLabel}]? This will update remaining hours and penalties.`,
    );
    if (!isConfirmed) return;

    const info = interns.find((i) => i.userId === log.userId);
    if (!info) return;

    await updateAttendance.run({
      id: log.id,
      payload: { evaluated: true, attribute: attr },
    });

    let remaining = parseFloat(info.remainingHours);

    // ============================================================
    // MARK: Attendance hour adjustment
    // We only trigger hour subtraction if the 'Entry' is allowed/tardy.
    // If 'Entry' is absent/excused, we don't subtract worked hours; we only add penalties.
    const pairType =
      log.type === "time-in"
        ? "break-out"
        : log.type === "break-in"
          ? "time-out"
          : null;

    if (pairType) {
      const pairedLog = logs.find((l) => l.type === pairType);

      if (pairedLog) {
        // ============================================================
        // MARK: Paired exit review
        // Automatically mark the 'Exit' log as evaluated to keep the UI clean
        await updateAttendance.run({
          id: pairedLog.id,
          payload: { evaluated: true, attribute: attr },
        });

        const diff =
          toDate(pairedLog.createdAt)!.getTime() -
          toDate(log.createdAt)!.getTime();
        const workedHours = Math.ceil(diff / 3600000);
        if (attr === "" || attr === "tardy") remaining -= workedHours;
      }
    }

    // ============================================================
    // MARK: Attendance penalties
    let payload: Partial<InternInfo> = { remainingHours: remaining.toString() };

    if (attr === "tardy") {
      const count = parseInt(info.tardinessCount) + 1;
      remaining += getTardinessPenalty(count);
      payload = {
        remainingHours: remaining.toString(),
        tardinessCount: count.toString(),
      };
    } else if (attr === "absent") {
      const count = parseInt(info.unexcusedAbsences) + 1;
      remaining += ABSENCE_RULES.unexcused.additionalHours;
      payload = {
        remainingHours: remaining.toString(),
        unexcusedAbsences: count.toString(),
      };
    } else if (attr === "excused") {
      remaining += ABSENCE_RULES.excused.additionalHours;
      payload.remainingHours = remaining.toString();
    }

    await updateInternInfo.run({ id: info.id, payload: payload });

    toast.success("Attendance Evaluated");
  };
  return {
    user,
    navigate,
    selectedLog,
    setSelectedLog,
    open,
    setOpen,
    users,
    departmentSettings,
    grouped,
    handleMark,
  };
}
