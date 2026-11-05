import { steps } from "@/features/InternDashboardPage/lib/shift";
import { useCurrentUser } from "@/shared/hooks/useAuth";
import { demoCoordinates, isDemo } from "@/shared/config/demo";
import { useRefreshOnFocus } from "@/shared/hooks/useRefreshOnFocus";
import { useResourceLocked } from "@/shared/lib/useResource";
import { sortByCreatedAt } from "@/shared/lib/utils";
import type { Attendance, CreateAttendance } from "@/shared/model/Attendance";
import type { User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { isToday } from "@saintrelion/time-functions";
import { useMemo, useState } from "react";

// ============================================================
// MARK: InternDashboard behavior
export function useInternDashboardPage() {
  const user = useCurrentUser<User>();
  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState(
    isDemo
      ? demoCoordinates
      : { lat: 8.59002112678708, lng: 123.34123498443732 },
  );

  const { useList: getAttendance, useInsert: insertAttendance } =
    useResourceLocked<Attendance, CreateAttendance>("attendance", {
      showToast: false,
    });
  const attendanceQuery = getAttendance({ filters: { userId: user.id } });
  useRefreshOnFocus(attendanceQuery.refetch);
  const attendance = sortByCreatedAt(attendanceQuery.data, "desc");

  const completedSteps = useMemo(() => {
    const todaysLogs = attendance.filter((log) => isToday(log.createdAt));
    return steps.filter((step) =>
      todaysLogs.some((log) => log.type === step.type),
    ).length;
  }, [attendance]);

  const nextStep = steps[completedSteps] ?? null;

  const logAttendance = async (capture: () => string | null) => {
    if (!nextStep || isSubmitting) return;
    const image = capture();
    if (!image) {
      toast.error(
        "Camera is not ready yet. Please check camera access and try again.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await insertAttendance.run({
        userId: user.id,
        type: nextStep.type,
        location: [coords.lat, coords.lng],
        image,
        attribute: "",
        evaluated: false,
      });
      await attendanceQuery.refetch();
      toast.info(`${nextStep.label} recorded`);
    } catch {
      toast.error("Attendance could not be recorded. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return {
    user,
    selectedLog,
    setSelectedLog,
    open,
    setOpen,
    isSubmitting,
    coords,
    setCoords,
    attendanceQuery,
    attendance,
    completedSteps,
    nextStep,
    logAttendance,
  };
}
