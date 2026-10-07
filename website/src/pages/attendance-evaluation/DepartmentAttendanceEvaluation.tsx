import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Calendar,
  CheckCircle2,
  ImageOff,
} from "lucide-react";

import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import {
  formatReadableDate,
  toDate,
  formatReadableDateTime,
} from "@saintrelion/time-functions";
import { sortByCreatedAt } from "@/lib/utils";
import { attendanceDateKey } from "@/lib/attendance";

import ViewAttendancePopup from "@/components/ViewAttendancePopup";
import type {
  Attendance,
  CreateAttendance,
  UpdateAttendance,
} from "@/models/Attendance";
import type { InternInfo, UpdateInternInfo } from "@/models/InternInfo";
import type { Settings } from "@/models/Settings";
import type { User } from "@/models/User";
import { toast } from "@saintrelion/notifications";

// --- TYPES & CONSTANTS ---
const ABSENCE_RULES = {
  excused: { additionalHours: 8 },
  unexcused: { additionalHours: 16 },
  maxUnexcusedBeforeReset: 5,
};

// --- LOGIC HELPERS ---
const getTardinessPenalty = (count: number): number => {
  const rules: Record<number, number> = { 1: 0, 2: 2, 3: 4, 4: 6 };
  return rules[count] ?? 6;
};

const isLate = (
  slot: string,
  createdAt: string,
  settings: Settings,
): boolean => {
  const actual = toDate(createdAt);
  if (!actual) return false;
  const expectedTime = slot === "break-in" ? "13:00" : settings.timeIn;
  const [h, m] = expectedTime.split(":").map(Number);
  const expected = new Date(actual);
  expected.setHours(h, m, 0, 0);
  return actual > expected;
};

export default function DepartmentAttendanceEvaluation() {
  const user = useCurrentUser<User>();
  const navigate = useNavigate();

  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  // --- DATA HOOKS ---
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

  // --- DATA FETCHING ---
  const users = getUsers({ filters: { department: user.department } }).data;
  const attendance = sortByCreatedAt(getAttendance({}).data, "asc");

  const interns = getInternInfos({}).data;
  const settings = getSettings({
    filters: { department: user.department },
  }).data;
  const departmentSettings = settings[0];

  // --- GROUPING LOGIC ---
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

  // --- ACTION HANDLERS ---
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

    // Apply Penalties based on Attribute
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

  // --- RENDER: SETTINGS CHECK ---
  if (!departmentSettings) {
    return (
      <div className="mx-auto max-w-2xl border border-[#152238]/12 bg-white px-6 py-12 text-center sm:px-10">
        <SettingsIcon size={28} className="mx-auto mb-5 text-[#1677ff]" />
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#152238]">
          Set your shift hours first
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Attendance review needs your department’s start and end times to evaluate late entries.
        </p>
        <button
          onClick={() => navigate("/departmentadviser/settings")}
          className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[#1677ff] px-5 text-sm font-semibold text-white hover:bg-[#0864db]"
        >
          <SettingsIcon size={16} /> Open shift rules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-[#152238]/15 pb-7">
        <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">Adviser / review</p>
        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">Review attendance</h1>
        <p className="mt-2 text-sm text-slate-600">Check captured entries and apply the correct attendance outcome for {user.department}.</p>
      </div>

      {selectedLog && (
        <ViewAttendancePopup
          record={selectedLog}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([userId, dates]) => {
          const u = users.find((x) => x.id === userId);
          return (
            <section key={userId} className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-[#152238]/15 pb-3">
                <h2 className="text-lg font-semibold text-[#152238]">
                  {u?.firstName} {u?.lastName}
                </h2>
                <span className="text-xs text-slate-500">{Object.keys(dates).length} {Object.keys(dates).length === 1 ? "day" : "days"}</span>
              </div>

              <div className="space-y-4">
                {Object.entries(dates).map(([date, logs]) => (
                  <DayCard
                    key={date}
                    date={date}
                    logs={logs}
                    settings={departmentSettings}
                    onView={(l: Attendance) => {
                      setSelectedLog(l);
                      setOpen(true);
                    }}
                    onMark={(l: Attendance, attr: string) =>
                      handleMark(
                        l,
                        logs,
                        attr as "excused" | "tardy" | "absent" | "",
                      )
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <p className="border border-dashed border-[#152238]/20 bg-white px-6 py-12 text-center text-sm text-slate-500">No attendance is available for review yet.</p>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DayCard({
  date,
  logs,
  settings,
  onView,
  onMark,
}: {
  date: string;
  logs: Attendance[];
  settings: Settings;
  onView: (l: Attendance) => void;
  onMark: (l: Attendance, attr: string) => void;
}) {
  const isToday = date === attendanceDateKey(new Date());

  return (
    <div className="border border-[#152238]/12 bg-white">
      <div className="flex items-center justify-between border-b border-[#152238]/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-[#1677ff]" />
          <span className="text-sm font-semibold text-[#152238]">
            {formatReadableDate(date)}
          </span>
          {isToday && (
            <span className="bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 uppercase">
              Today
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-[#152238]/10">
        {logs.map((log: Attendance) => {
          const isEntry = log.type === "time-in" || log.type === "break-in";
          const late = isEntry && isLate(log.type, log.createdAt, settings);

          return (
            <div key={log.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button type="button" onClick={() => onView(log)} className="flex min-w-0 items-center gap-4 text-left">
                <div className="h-14 w-16 shrink-0 overflow-hidden bg-slate-100">
                  {log.image ? (
                    <img
                      src={log.image}
                      className="h-full w-full object-cover"
                      alt="Attendance capture"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                      <ImageOff size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                      {log.type.replace("-", " ")}
                    </p>
                    {late && !log.evaluated && (
                      <span className="rounded bg-amber-50 px-1.5 text-[8px] font-black text-amber-600 uppercase">
                        Flagged: Late
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#152238]">
                    {formatReadableDateTime(log.createdAt)}
                  </p>
                </div>
              </button>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {!log.evaluated ? (
                  <div className="flex flex-wrap gap-2">
                    {isEntry ? (
                      <>
                        {late ? (
                          <>
                            <AuditBtn
                              label="Tardy"
                              variant="amber"
                              onClick={() => onMark(log, "tardy")}
                            />
                            <AuditBtn
                              label="Excuse"
                              variant="blue"
                              onClick={() => onMark(log, "excused")}
                            />
                          </>
                        ) : (
                          <AuditBtn
                            label="Verify"
                            variant="blue"
                            onClick={() => onMark(log, "")}
                          />
                        )}
                        <AuditBtn
                          label="Absent"
                          variant="rose"
                          onClick={() => onMark(log, "absent")}
                        />
                      </>
                    ) : (
                      <span className="mr-2 text-[10px] font-black tracking-tighter text-slate-300 uppercase italic">
                        Awaiting Entry Check
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <StatusTag attr={log.attribute} />
                    <CheckCircle2 size={18} className="text-[#1677ff]" />
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

// --- MICRO COMPONENTS ---

function AuditBtn({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: string;
  onClick: () => void;
}) {
  const styles: Record<string, string> = {
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      className={`min-h-9 px-3 text-[10px] font-semibold uppercase transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function StatusTag({ attr }: { attr: string }) {
  if (!attr)
    return (
      <span className="text-[10px] font-semibold text-[#1677ff] uppercase">
        Cleared
      </span>
    );
  const styles: Record<string, string> = {
    excused: "text-blue-500",
    tardy: "text-amber-500",
    absent: "text-rose-500",
  };
  return (
    <span
      className={`text-[9px] font-black tracking-widest uppercase ${styles[attr]}`}
    >
      {attr}
    </span>
  );
}
