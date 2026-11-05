import { AuditBtn } from "@/features/DepartmentAttendanceEvaluationPage/components/AuditBtn";
import { StatusTag } from "@/features/DepartmentAttendanceEvaluationPage/components/StatusTag";
import { isLate } from "@/features/DepartmentAttendanceEvaluationPage/lib/attendance-review";
import { attendanceDateKey } from "@/shared/lib/attendance";
import type { Attendance } from "@/shared/model/Attendance";
import type { Settings } from "@/shared/model/Settings";
import {
  formatReadableDate,
  formatReadableDateTime,
} from "@saintrelion/time-functions";
import { Calendar, CheckCircle2, ImageOff } from "lucide-react";

// ============================================================
// MARK: Attendance components

export function DayCard({
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
            <div
              key={log.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <button
                type="button"
                onClick={() => onView(log)}
                className="flex min-w-0 items-center gap-4 text-left"
              >
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
