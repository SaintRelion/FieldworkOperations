import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AttendanceLog } from "@/models/attendance";

import {
  formatReadableDateTime,
  getCurrentDateTime,
  isSameDay,
} from "@saintrelion/time-functions";
import { useDBOperations } from "@saintrelion/data-access-layer";
import { useAuth } from "@saintrelion/auth-lib";
import { GeoViewer } from "@/to-be-library/geo/geo-viewer";
import type { Coords } from "@/to-be-library/geo/geo-models";
import { LiveClock } from "@/to-be-library/live/live-clock";
import { CameraCapture } from "@/to-be-library/live/camera-capture";
import type { Settings } from "@/models/settings";
import type { InternInfo } from "@/models/intern-info";

export default function InternDashboardPage() {
  const { user } = useAuth();

  let coords: Coords = { lat: 0, lng: 0 };
  function onCoordinateChange(c: Coords) {
    coords = c;
  }

  let liveTime: string = "";
  function onTimeChanged(time: string) {
    liveTime = time;
  }

  const { useSelect: settingsSelect } = useDBOperations<Settings>("Settings");
  const { data: settingsList = [] } = settingsSelect({
    firebaseOptions: {
      filterField: "department",
      value: user?.department,
    },
  });

  const { useSelect: interInfoSelect, useUpdate: internInfoUpdate } =
    useDBOperations<InternInfo>("InternInfo");
  const { data: internInfo = [] } = interInfoSelect({
    firebaseOptions: {
      filterField: ["userId"],
      value: [user.id],
    },
  });

  const { useSelect: attendanceSelect, useInsert: attendanceInsert } =
    useDBOperations<AttendanceLog>("AttendanceLog");

  const { data: attendanceLogs = [] } = attendanceSelect({
    mockOptions: {
      filterFn: (log) => log.userID === user.id,
      sortFn: (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    },
    firebaseOptions: {
      filterField: ["userID"],
      value: [user.id],
      // sort: { field: "createdAt", direction: "desc" },
    },
  });
  const sortedDate = attendanceLogs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const [timedIn, setTimedIn] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const today = getCurrentDateTime().slice(0, 10);
    console.log(today);
    console.log("----");

    const inToday = attendanceLogs.some((log) => {
      console.log(log.createdAt);
      return isSameDay(today, log.createdAt) && log.type === "in";
    });

    const outToday = attendanceLogs.some((log) => {
      return isSameDay(today, log.createdAt) && log.type === "out";
    });

    setTimedIn(inToday);
    setTimedOut(outToday);
  }, [attendanceLogs]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Side: Live Camera + Controls */}
      <div className="space-y-4">
        <h1>Attendance Tracker</h1>
        {/* Live Time */}
        <LiveClock onTimeChanged={onTimeChanged} />

        <CameraCapture>
          {({ capture, isCapturing }) => (
            <>
              {!timedIn || timedOut ? (
                <Button
                  onClick={async () => {
                    if (isCapturing) return;

                    // Capture image first
                    const img = capture();

                    // --- Save attendance record ---
                    attendanceInsert.mutate({
                      userID: user.id,
                      type: "in",
                      location: coords ? [coords.lat, coords.lng] : [0, 0],
                      image: img ?? "",
                    });
                    if (settingsList[0] && internInfo[0]) {
                      // Parse current time and expected time-in
                      const currentTime = new Date(liveTime);
                      const [hours, minutes] = settingsList[0].timeIn
                        .split(":")
                        .map(Number);
                      const expectedTime = new Date(currentTime);
                      expectedTime.setHours(hours, minutes, 0, 0);

                      // Difference in minutes
                      const diffMinutes =
                        (currentTime.getTime() - expectedTime.getTime()) /
                        60000;

                      if (diffMinutes > settingsList[0].gracePeriodMinutes) {
                        const overBy =
                          diffMinutes - settingsList[0].gracePeriodMinutes;

                        // Example: every 3 min past grace = +1 penalty unit
                        const penaltyUnits = Math.floor(
                          overBy / settingsList[0].gracePeriodMinutes,
                        );

                        const penalty =
                          penaltyUnits * settingsList[0].penaltyRate;

                        alert(
                          `[Penalty] Late by ${diffMinutes.toFixed(
                            1,
                          )}min → ${penaltyUnits} units → +${penalty} hours`,
                        );

                        // Add the penalty to hours
                        const requiredHours =
                          Number(internInfo[0].requiredHours) || 0;
                        const remainingHours =
                          Number(internInfo[0].remainingHours) || 0;

                        const updatedRequired = requiredHours + penalty;
                        const updatedRemaining = remainingHours + penalty;

                        if (internInfoUpdate)
                          internInfoUpdate.mutate({
                            field: "userId",
                            value: user.id,
                            updates: {
                              requiredHours: updatedRequired,
                              remainingHours: updatedRemaining,
                            },
                          });
                      }
                    }

                    setTimedIn(true);
                  }}
                  disabled={isCapturing || timedOut}
                  className="px-6"
                >
                  {isCapturing ? "Saving..." : "Time In"}
                </Button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const img = capture();

                      attendanceInsert.mutate({
                        userID: user.id,
                        type: "update",
                        location: coords ? [coords.lat, coords.lng] : [0, 0],
                        image: img ?? "",
                      });
                    }}
                    disabled={isCapturing}
                  >
                    {isCapturing ? "Saving..." : "Periodic Update"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const img = capture();

                      // Find today's logs
                      const today = new Date().toISOString().slice(0, 10);
                      const todayLogs = attendanceLogs.filter((log) => {
                        const logDate = new Date(log.createdAt)
                          .toISOString()
                          .slice(0, 10);
                        return logDate === today && log.userID === user.id;
                      });

                      const timeInLog = todayLogs.find((l) => l.type === "in");
                      if (timeInLog) {
                        const timeIn = new Date(timeInLog.createdAt);
                        const current = new Date(); // use real local time instead of liveTime if it's in UTC

                        const [outHour, outMin] = (
                          settingsList[0]?.timeOut ?? "17:00"
                        )
                          .split(":")
                          .map(Number);

                        // Use the same local date as timeIn (not UTC string)
                        const settingsOut = new Date(timeIn);
                        settingsOut.setHours(outHour, outMin, 0, 0);

                        // --- Clamp actualOut to settingsOut ---
                        const actualOut =
                          current > settingsOut ? settingsOut : current;

                        // Calculate duration in hours (2 decimal)

                        // --- Calculate duration safely ---
                        const diffMs = actualOut.getTime() - timeIn.getTime();
                        const diffHours = Math.max(diffMs / 1000 / 60 / 60, 0);

                        const workedHours = Math.round(diffHours * 100) / 100;

                        // Save Time Out record
                        attendanceInsert.mutate({
                          userID: user.id,
                          type: "out",
                          location: coords ? [coords.lat, coords.lng] : [0, 0],
                          image: img ?? "",
                        });

                        // Deduct from intern info
                        const remaining =
                          Number(internInfo[0].remainingHours) || 0;

                        const updatedRemaining = Math.max(
                          remaining - workedHours,
                          0,
                        );

                        console.log(internInfo[0].remainingHours);

                        internInfoUpdate.mutate({
                          field: "userId",
                          value: user.id,
                          updates: {
                            remainingHours: updatedRemaining,
                            // // Optional: add workedHours field to track progress
                            // workedHours:
                            //   (Number(intern.workedHours) || 0) + diffHours,
                          },
                        });

                        alert(
                          `[Work Hours] ${diffHours.toFixed(
                            2,
                          )}h worked. Remaining: ${updatedRemaining.toFixed(2)}h`,
                        );
                      }

                      setTimedOut(false);
                    }}
                  >
                    Time Out
                  </Button>
                </div>
              )}
            </>
          )}
        </CameraCapture>

        {/* Info */}
        <div className="text-md space-y-1">
          <GeoViewer
            showControls={false}
            onCoordinateChange={onCoordinateChange}
            geoOptions={{ mode: "track" }}
          />
        </div>
      </div>

      {/* Right Side: Attendance Logs */}
      <div className="max-h-[600px] space-y-3 overflow-y-auto">
        <h1>Attendance History</h1>
        {sortedDate.length === 0 && (
          <p className="text-muted-foreground text-center text-sm">
            No attendance logs yet.
          </p>
        )}

        {sortedDate.map((log, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border p-2 shadow-sm"
          >
            <img
              src={log.image}
              alt="log"
              className="h-16 w-20 rounded-md border object-cover"
            />
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {formatReadableDateTime(log.createdAt)}
              </span>
              <span className="text-muted-foreground">
                {log.location[0]}, {log.location[1]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
