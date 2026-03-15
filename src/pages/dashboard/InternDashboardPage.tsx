import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Attendance, CreateAttendance } from "@/models/Attendance";

import {
  formatReadableDateTime,
  getCurrentDateTimeString,
  isSameDay,
} from "@saintrelion/time-functions";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { GeoViewer } from "@/to-be-library/geo/geo-viewer";
import { LiveClock } from "@/to-be-library/live/live-clock";
import { CameraCapture } from "@/to-be-library/live/camera-capture";
import type { User } from "@/models/User";
import { sortByCreatedAt } from "@/lib/utils";
import ViewAttendancePopup from "@/components/ViewAttendancePopup";

const LOG_TYPE_META: Record<
  "time-in" | "break-in" | "break-out" | "time-out",
  { label: string; color: string; bg: string }
> = {
  "time-in": {
    label: "Time In",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  "break-out": {
    label: "Break Out",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  "break-in": {
    label: "Break In",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
  },
  "time-out": {
    label: "Time Out",
    color: "text-red-700",
    bg: "bg-red-100",
  },
};

export default function InternDashboardPage() {
  const user = useCurrentUser<User>();

  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState(false);

  const { useList: getAttendance, useInsert: insertAttendance } =
    useResourceLocked<Attendance, CreateAttendance>("attendance");

  let coords = { lat: 0, lng: 0 };

  // ---------------------------------------------
  // Derive today's attendance state for each type
  // ---------------------------------------------
  const [todayState, setTodayState] = useState<{
    "time-in": boolean;
    "break-out": boolean;
    "break-in": boolean;
    "time-out": boolean;
  }>({
    "time-in": false,
    "break-out": false,
    "break-in": false,
    "time-out": false,
  });

  const evalAttendanceState = () => {
    const today = getCurrentDateTimeString().slice(0, 10);

    const state: typeof todayState = {
      "time-in": false,
      "break-out": false,
      "break-in": false,
      "time-out": false,
    };

    for (const log of attendance) {
      if (isSameDay(today, log.createdAt)) {
        state[log.type] = true;
      }
    }

    setTodayState(state);
  };

  const attendanceQuery = getAttendance({ filters: { userId: user.id } });
  const attendance = useMemo(() => {
    if (!attendanceQuery.data) return [];
    return sortByCreatedAt(attendanceQuery.data);
  }, [attendanceQuery.data]);

  useEffect(() => {
    evalAttendanceState();
  }, [attendance]);

  const logAttendance = async (
    type: Attendance["type"],
    capture: () => string | null,
  ) => {
    await insertAttendance.run({
      userId: user.id,
      type,
      location: [coords.lat, coords.lng],
      image: capture() ?? "",
      attribute: "",
      evaluated: false,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {selectedLog && (
        <ViewAttendancePopup
          record={selectedLog}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {/* Left Side: Live Camera + Controls */}
      <div className="space-y-4">
        <h1>Attendance Tracker</h1>
        {/* Live Time */}
        <LiveClock />

        <CameraCapture>
          {({ capture, isCapturing }) => (
            <div className="flex flex-wrap gap-2">
              {/* Time In */}
              <Button
                disabled={isCapturing || todayState["time-in"]}
                onClick={() => logAttendance("time-in", capture)}
              >
                Time In
              </Button>

              {/* Break Out */}
              <Button
                variant="secondary"
                disabled={
                  isCapturing ||
                  !todayState["time-in"] || // must have broken in
                  todayState["break-out"]
                }
                onClick={() => logAttendance("break-out", capture)}
              >
                Break Out
              </Button>

              {/* Break In */}
              <Button
                variant="secondary"
                disabled={
                  isCapturing ||
                  !todayState["break-out"] || // can't break in before time-in
                  todayState["break-in"]
                }
                onClick={() => logAttendance("break-in", capture)}
              >
                Break In
              </Button>

              {/* Time Out */}
              <Button
                variant="destructive"
                disabled={
                  isCapturing ||
                  !todayState["time-in"] ||
                  todayState["time-out"]
                }
                onClick={() => logAttendance("time-out", capture)}
              >
                Time Out
              </Button>
            </div>
          )}
        </CameraCapture>

        {/* Info */}
        <div className="text-md space-y-1">
          <GeoViewer
            showControls={false}
            onCoordinateChange={(c) => (coords = c)}
            geoOptions={{ mode: "track" }}
          />
        </div>
      </div>

      {/* Right Side: Attendance Logs */}
      <div className="max-h-[600px] space-y-3 overflow-y-auto p-2">
        <h1 className="text-xl font-semibold">Attendance History</h1>

        {attendance.map((log) => {
          const meta = LOG_TYPE_META[log.type];

          return (
            <div
              key={log.id}
              onClick={() => {
                setSelectedLog(log);
                setOpen(true);
              }}
              className="flex cursor-pointer gap-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm hover:shadow-lg"
            >
              {/* Attendance Image */}
              <img
                src={log.image}
                alt="attendance"
                className="h-22 w-22 rounded-md border object-cover"
              />

              {/* Log Details */}
              <div className="flex-1 space-y-1">
                {/* Type badge */}
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color} ${meta.bg}`}
                >
                  {meta.label}
                </div>

                {/* Timestamp */}
                <div className="text-sm text-gray-900">
                  {formatReadableDateTime(log.createdAt)}
                </div>

                {/* Location */}
                <div className="text-muted-foreground text-xs">
                  {log.location.join(", ")}
                </div>

                {/* Evaluation Status */}
                {log.attribute ? (
                  <div
                    className={`text-xs font-medium ${
                      log.attribute === "excused"
                        ? "text-blue-600"
                        : log.attribute === "tardy"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {log.attribute === "excused" && "🟦 Excused"}
                    {log.attribute === "tardy" && "🟨 Tardy"}
                    {log.attribute === "absent" && "🟥 Absent"}
                  </div>
                ) : log.evaluated ? (
                  <span className="w-fit rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    ✔ Done
                  </span>
                ) : (
                  <div className="text-xs font-medium text-orange-600">
                    ⏳ Pending Evaluation
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
