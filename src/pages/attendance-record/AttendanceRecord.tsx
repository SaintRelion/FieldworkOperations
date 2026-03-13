import ViewAttendancePopup from "@/components/ViewAttendancePopup";
import type { Attendance } from "@/models/Attendance";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import {
  formatReadableDate,
  formatReadableDateTime,
  toDate,
} from "@saintrelion/time-functions";
import { useState } from "react";

const LOG_TYPE_META: Record<
  "time-in" | "break-in" | "break-out" | "time-out",
  { label: string; color: string; bg: string }
> = {
  "time-in": {
    label: "Time In",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  "break-in": {
    label: "Break In",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  "break-out": {
    label: "Break Out",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
  },
  "time-out": {
    label: "Time Out",
    color: "text-red-700",
    bg: "bg-red-100",
  },
};

function formatDateTime(datetime: string) {
  const dateObj = new Date(datetime.replace(" ", "T")); // ensure valid Date
  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

const AttendanceRecord = () => {
  const user = useCurrentUser<User>();

  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState(false);

  // Intern Attendance Select
  const { useList: getAttendance } =
    useResourceLocked<Attendance>("attendance");

  const attendance =
    getAttendance({
      filters: { userId: user.id },
    }).data ?? [];

  // Group by date
  const grouped = attendance.reduce(
    (acc, rec) => {
      const date = formatReadableDate(rec.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(rec);
      return acc;
    },
    {} as Record<string, Attendance[]>,
  );

  // Sort groups by date descending
  const sortedGrouped = Object.entries(grouped).sort(([dateA], [dateB]) => {
    const toDateB = toDate(dateB);
    const toDateA = toDate(dateA);
    if (toDateB && toDateA) return toDateB.getTime() - toDateA.getTime();
    return -1;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Attendance Record</h1>

      {selectedLog && (
        <ViewAttendancePopup
          record={selectedLog}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {attendance.length === 0 ? (
        <p className="text-sm text-gray-500">No attendance found.</p>
      ) : (
        <div className="max-h-[600px] space-y-6 overflow-y-auto p-2">
          {sortedGrouped.map(([date, logs]) => {
            const sortedLogs = logs.sort((a, b) => {
              const toDateB = toDate(b.createdAt);
              const toDateA = toDate(a.createdAt);
              if (toDateB && toDateA)
                return toDateB.getTime() - toDateA.getTime();
              return -1;
            });

            return (
              <div key={date}>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  {formatDateTime(date).date}
                </h3>

                <ul className="space-y-2">
                  {sortedLogs.map((rec) => {
                    const meta = LOG_TYPE_META[rec.type];

                    return (
                      <li
                        key={rec.id}
                        onClick={() => {
                          setSelectedLog(rec);
                          setOpen(true);
                        }}
                        className="flex cursor-pointer gap-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm hover:shadow-lg"
                      >
                        {/* Attendance Image */}
                        <img
                          src={rec.image}
                          alt="Attendance snapshot"
                          className="h-20 w-24 rounded-md border object-cover"
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
                            {formatReadableDateTime(rec.createdAt)}
                          </div>

                          {/* Location */}
                          <div className="text-muted-foreground text-xs">
                            Lat: {rec.location[0]}, Lng: {rec.location[1]}
                          </div>

                          {/* Evaluation Status */}
                          {rec.attribute ? (
                            <div
                              className={`text-xs font-medium ${
                                rec.attribute === "excused"
                                  ? "text-blue-600"
                                  : rec.attribute === "tardy"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {rec.attribute === "excused" && "🟦 Excused"}
                              {rec.attribute === "tardy" && "🟨 Tardy"}
                              {rec.attribute === "absent" && "🟥 Absent"}
                            </div>
                          ) : rec.evaluated ? (
                            <span className="w-fit rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              ✔ Done
                            </span>
                          ) : (
                            <div className="text-xs font-medium text-orange-600">
                              ⏳ Pending Evaluation
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceRecord;
