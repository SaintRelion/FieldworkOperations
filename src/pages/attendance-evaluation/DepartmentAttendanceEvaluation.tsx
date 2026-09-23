import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Settings as SettingsIcon,
  UserCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ImageOff,
} from "lucide-react";

import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import {
  formatReadableDate,
  toDate,
  getCurrentDateTimeString,
  formatReadableDateTime,
} from "@saintrelion/time-functions";
import { sortByCreatedAt } from "@/lib/utils";

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
        const dateKey = d.toISOString().split("T")[0];
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
          payload: { evaluated: true, attribute: "" },
        });

        const diff =
          toDate(pairedLog.createdAt)!.getTime() -
          toDate(log.createdAt)!.getTime();
        const workedHours = Math.ceil(diff / 3600000);
        remaining -= workedHours;
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-12 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-slate-900 text-emerald-500 shadow-2xl shadow-slate-200">
          <SettingsIcon
            size={40}
            className="animate-[spin_4s_linear_infinite]"
          />
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">
          System Sync Required
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed font-bold text-slate-400">
          The evaluation terminal cannot process tardiness without department
          time-bounds.
        </p>
        <button
          onClick={() => navigate("/departmentadviser/settings")}
          className="mt-10 flex items-center gap-3 rounded-2xl bg-emerald-600 px-10 py-4 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
        >
          <SettingsIcon size={16} /> Configure Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-6 border-b border-slate-200 px-2 pb-10 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-slate-900 text-white shadow-2xl shadow-slate-200">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">
              Audit <span className="text-emerald-600">Terminal</span>
            </h1>
            <p className="mt-1 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
              Active Monitoring / {user.department}
            </p>
          </div>
        </div>
      </div>

      {selectedLog && (
        <ViewAttendancePopup
          record={selectedLog}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {/* USER LIST */}
      <div className="space-y-16">
        {Object.entries(grouped).map(([userId, dates]) => {
          const u = users.find((x) => x.id === userId);
          return (
            <div key={userId} className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter text-slate-800">
                  {u?.firstName} {u?.lastName}
                </h2>
              </div>

              <div className="ml-5 space-y-8 border-l-2 border-slate-100 pl-10">
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
            </div>
          );
        })}
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
  const isToday = date === getCurrentDateTimeString().slice(0, 10);

  return (
    <div
      className={`rounded-[2.5rem] border p-8 transition-all ${isToday ? "border-emerald-100 bg-white shadow-2xl shadow-emerald-900/5" : "border-slate-100 bg-slate-50/50"}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-[11px] font-black tracking-widest text-slate-800 uppercase">
            {formatReadableDate(date)}
          </span>
          {isToday && (
            <span className="animate-pulse rounded-full bg-emerald-500 px-3 py-1 text-[9px] font-black text-white uppercase">
              Live Session
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log: Attendance) => {
          const isEntry = log.type === "time-in" || log.type === "break-in";
          const late = isEntry && isLate(log.type, log.createdAt, settings);

          return (
            <div
              key={log.id}
              onClick={() => onView(log)}
              className="group flex cursor-pointer items-center justify-between rounded-[2rem] border border-slate-100 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-20 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  {log.image ? (
                    <img
                      src={log.image}
                      className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                      alt="auth"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                      <ImageOff size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                      {log.type.replace("-", " ")}
                    </p>
                    {late && !log.evaluated && (
                      <span className="rounded bg-amber-50 px-1.5 text-[8px] font-black text-amber-600 uppercase">
                        Flagged: Late
                      </span>
                    )}
                  </div>
                  <p className="text-base font-black text-slate-800">
                    {formatReadableDateTime(log.createdAt).split("at")[1]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!log.evaluated ? (
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                            variant="emerald"
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
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                )}
                <ArrowRight
                  size={16}
                  className="text-slate-200 transition-transform group-hover:translate-x-1"
                />
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
    emerald:
      "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function StatusTag({ attr }: { attr: string }) {
  if (!attr)
    return (
      <span className="text-[9px] font-black text-emerald-500 uppercase">
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
