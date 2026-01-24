import { Button } from "@/components/ui/button";
import { sortByCreatedAt } from "@/lib/utils";
import type {
  Attendance,
  CreateAttendance,
  UpdateAttendance,
} from "@/models/Attendance";
import type { InternInfo, UpdateInternInfo } from "@/models/InternInfo";
import type { Settings } from "@/models/Settings";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import {
  formatReadableDate,
  formatReadableDateTime,
  toDate,
} from "@saintrelion/time-functions";
import { useMemo } from "react";

const SLOTS = ["time-in", "break-out", "break-in", "time-out"] as const;

type SlotType = (typeof SLOTS)[number];

const ABSENCE_RULES = {
  excused: { additionalHours: 8 },
  unexcused: { additionalHours: 16 },
  maxUnexcusedBeforeReset: 5,
};

const TARDINESS_RULES = [
  { offense: 1, additionalHours: 0 },
  { offense: 2, additionalHours: 2 },
  { offense: 3, additionalHours: 4 },
  { offense: 4, additionalHours: 6 },
];

const getTardinessPenaltyHours = (count: number) => {
  const rule = TARDINESS_RULES.find((r) => r.offense === count);
  return rule ? rule.additionalHours : 6;
};

const getAbsencePenaltyHours = (unexcusedCount: number) => {
  if (unexcusedCount >= ABSENCE_RULES.maxUnexcusedBeforeReset) {
    return ABSENCE_RULES.unexcused.additionalHours;
  }
  return ABSENCE_RULES.unexcused.additionalHours;
};

/* -------------------- HELPERS -------------------- */

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

function hasDayEnded(dateStr: string) {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function getExpectedTime(date: Date, timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function isLate(slot: string, createdAt: string, settings: Settings) {
  const actual = toDate(createdAt)!;
  const expected = getExpectedTime(
    actual,
    slot == "break-in" ? "13:00" : settings.timeIn,
  );
  return actual > expected;
}

export default function DepartmentAttendanceEvaluation() {
  const user = useCurrentUser<User>();

  const { useList: getUsers } = useResourceLocked<User>("user");
  const {
    useList: getAttendance,
    useInsert: insertAttendance,
    useUpdate: updateAttendance,
  } = useResourceLocked<Attendance, CreateAttendance, UpdateAttendance>(
    "attendance",
  );
  const { useList: getInternInfos, useUpdate: updateInternInfo } =
    useResourceLocked<InternInfo, never, UpdateInternInfo>("interninfo");
  const { useList: getSettings } = useResourceLocked<Settings>("settings");

  const users = getUsers({}).data;
  const attendance = sortByCreatedAt(getAttendance({}).data, "asc");
  const interns = getInternInfos({
    // filters: { department: user.department },
  }).data;
  const settings = getSettings({
    // filters: { department: user.department },
  }).data;

  const departmentSettings = settings[0];

  /* -------- GROUP BY USER + DATE -------- */
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Attendance[]>> = {};

    attendance.forEach((log) => {
      const d = toDate(log.createdAt);
      if (!d) return;

      const date =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");

      if (!map[log.userId]) map[log.userId] = {};
      if (!map[log.userId][date]) map[log.userId][date] = [];

      map[log.userId][date].push(log);
    });

    return map;
  }, [attendance]);

  const markExisting = async (
    log: Attendance,
    logsForTheDay: Attendance[], // all logs for this user/date
    attribute: "excused" | "tardy" | "",
  ) => {
    const internInfo = interns.find((i) => i.userId === log.userId);
    if (!internInfo) return;

    await updateAttendance.run({
      id: log.id,
      payload: { evaluated: true, attribute },
    });

    let finalRemainingHours = parseFloat(internInfo.remainingHours);

    // ---- Calculate worked hours based on paired slots ----
    const pairedSlotType =
      log.type === "time-in"
        ? "break-out"
        : log.type === "break-in"
          ? "time-out"
          : null;

    if (pairedSlotType) {
      const pairedLog = logsForTheDay.find(
        (l) => l.type === pairedSlotType && !l.evaluated,
      );

      if (pairedLog && !pairedLog.evaluated) {
        const pairedLogToDate = toDate(pairedLog.createdAt);
        const logToDate = toDate(log.createdAt);

        if (pairedLogToDate && logToDate) {
          const diffMs = pairedLogToDate.getTime() - logToDate.getTime();
          const workedHours = Math.ceil(diffMs / 3600000); // round up
          finalRemainingHours -= workedHours; // subtract worked hours
        }
      }
    }

    // ---- Apply tardy/excused penalties ----
    if (attribute === "tardy") {
      const newTardiness = parseInt(internInfo.tardinessCount) + 1;
      const addedHours = getTardinessPenaltyHours(newTardiness);
      finalRemainingHours += addedHours;

      // update tardiness count too
      await updateInternInfo.run({
        id: internInfo.id,
        payload: {
          remainingHours: finalRemainingHours.toString(),
          tardinessCount: newTardiness.toString(),
        },
      });
      return; // done
    }

    if (attribute === "excused") {
      finalRemainingHours += ABSENCE_RULES.excused.additionalHours;
    }

    // ---- Single update call ----
    await updateInternInfo.run({
      id: internInfo.id,
      payload: {
        remainingHours: finalRemainingHours.toString(),
      },
    });
  };

  const createSlot = async (
    userId: string,
    slot: SlotType,
    attribute: "excused" | "absent",
  ) => {
    const internInfo = interns.find((i) => i.userId === userId);

    if (!internInfo) return;

    await insertAttendance.run({
      userId,
      type: slot,
      attribute,
      evaluated: true,
      image: "",
      location: [],
    });

    if (attribute === "absent") {
      const newUnexcused = parseInt(internInfo.unexcusedAbsences) + 1;
      const addedHours = getAbsencePenaltyHours(newUnexcused);

      await updateInternInfo.run({
        id: internInfo.id,
        payload: {
          unexcusedAbsences: newUnexcused.toString(),
          remainingHours: (
            parseInt(internInfo.remainingHours) + addedHours
          ).toString(),
        },
      });
    }

    if (attribute === "excused") {
      await updateInternInfo.run({
        id: internInfo.id,
        payload: {
          remainingHours: (
            parseInt(internInfo.remainingHours) +
            ABSENCE_RULES.excused.additionalHours
          ).toString(),
        },
      });
    }
  };

  const createWholeDay = async (
    userId: string,
    attribute: "excused" | "absent",
  ) => {
    await Promise.all(SLOTS.map((slot) => createSlot(userId, slot, attribute)));
  };

  if (!departmentSettings)
    return (
      <h5 className="text-sm text-gray-600 italic">
        No department settings found (navigate to Settings page and Save)
      </h5>
    );

  return (
    <div className="space-y-4">
      <h1>Attendance Evaluation – {user.department}</h1>

      {Object.entries(grouped).map(([userId, dates]) => {
        const u = users.find((x) => x.id === userId);

        return (
          <div key={userId} className="space-y-4 rounded-xl border p-4">
            <div className="font-semibold">
              {u?.firstName} {u?.lastName}
            </div>

            {Object.entries(dates).map(([date, logs]) => {
              const ended = hasDayEnded(date);
              const today = isToday(date);

              const slotMap = Object.fromEntries(
                logs.map((l) => [l.type, l]),
              ) as Partial<Record<SlotType, Attendance>>;

              /* ---- CURRENT DAY ---- */
              if (today) {
                return (
                  <div key={date} className="rounded border bg-slate-50 p-3">
                    <div className="text-sm text-slate-600">
                      {formatReadableDate(date)}
                    </div>
                    <div className="text-sm text-gray-500 italic">
                      Day has not ended yet
                    </div>

                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="mb-2 flex justify-between border-b-1 text-sm"
                      >
                        <span>
                          {log.type} - {formatReadableDateTime(log.createdAt)}
                        </span>

                        {!log.evaluated ? (
                          <div className="text-xs font-medium text-orange-600">
                            ⏳ Pending Evaluation
                          </div>
                        ) : log.attribute ? (
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
                        ) : (
                          <div className="text-xs font-medium text-green-600">
                            Done
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              /* ---- FULL ABSENT ---- */
              if (ended && logs.length === 0) {
                return (
                  <div key={date} className="rounded border bg-red-50 p-3">
                    <div className="text-sm">{date}</div>
                    <div className="flex items-center justify-between">
                      <span>[ALL] No record</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => createWholeDay(userId, "absent")}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => createWholeDay(userId, "excused")}
                        >
                          Excuse
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              /* ---- PARTIAL ---- */
              return (
                <div key={date} className="rounded border bg-slate-50 p-3">
                  <div className="mb-2 text-sm">{formatReadableDate(date)}</div>

                  {SLOTS.map((slot) => {
                    const log = slotMap[slot];

                    if (!log) {
                      return (
                        <div
                          key={slot}
                          className="mb-2 flex items-center justify-between border-b-1 text-sm text-orange-600"
                        >
                          <span>[{slot}] No record</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-red-600"
                              onClick={() => createSlot(userId, slot, "absent")}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                createSlot(userId, slot, "excused")
                              }
                            >
                              Excuse
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    const late =
                      (slot === "time-in" || slot === "break-in") &&
                      isLate(slot, log.createdAt, departmentSettings);

                    return (
                      <div
                        key={log.id}
                        className="mb-2 flex items-center justify-between border-b-1 text-sm"
                      >
                        <span>
                          {slot} — {formatReadableDateTime(log.createdAt)}
                        </span>

                        {!log.evaluated ? (
                          <div className="text-xs font-medium text-orange-600">
                            ⏳ Pending Evaluation
                          </div>
                        ) : log.attribute ? (
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
                        ) : (
                          <div className="text-xs font-medium text-green-600">
                            Done
                          </div>
                        )}

                        {!log.evaluated && late && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => markExisting(log, logs, "tardy")}
                            >
                              Tardy
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => markExisting(log, logs, "excused")}
                            >
                              Excuse
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600"
                              onClick={() => createSlot(userId, slot, "absent")}
                            >
                              Absent
                            </Button>
                          </div>
                        )}

                        {!log.evaluated && !late && (
                          <Button
                            size="sm"
                            className="bg-green-600"
                            onClick={() => markExisting(log, logs, "")}
                          >
                            Allow
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
