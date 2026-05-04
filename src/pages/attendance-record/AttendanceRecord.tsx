import { useState, useMemo } from "react";
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
import {
  Calendar,
  History,
  MapPin,
  CheckCircle2,
  Timer,
  ArrowRight,
} from "lucide-react";
import AccomplishmentReportDialog from "@/components/reports/AccomplishmentReportDialog";
import DTRReportDialog from "@/components/reports/DTRReportDialog";

const LOG_TYPE_THEME: Record<
  string,
  { label: string; ring: string; text: string; bg: string }
> = {
  "time-in": {
    label: "Shift Start",
    ring: "ring-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  "break-out": {
    label: "Break Started",
    ring: "ring-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  "break-in": {
    label: "Break Finished",
    ring: "ring-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  "time-out": {
    label: "Shift End",
    ring: "ring-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
};

const AttendanceRecord = () => {
  const user = useCurrentUser<User>();
  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const { useList: getAttendance } =
    useResourceLocked<Attendance>("attendance");
  const attendance = getAttendance({ filters: { userId: user.id } }).data;

  // 1. Grouping and Sorting Logic (Strict TSX)
  const sortedGrouped = useMemo(() => {
    const grouped = attendance.reduce(
      (acc, rec) => {
        const date = formatReadableDate(rec.createdAt);
        if (!acc[date]) acc[date] = [];
        acc[date].push(rec);
        return acc;
      },
      {} as Record<string, Attendance[]>,
    );

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      const toDateB = toDate(dateB);
      const toDateA = toDate(dateA);
      if (toDateB && toDateA) return toDateB.getTime() - toDateA.getTime();
      return -1;
    });
  }, [attendance]);

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-800">
            Attendance <span className="text-emerald-600">Archive</span>
          </h1>
          <p className="mt-1 text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
            Historical Session Records
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Only show if there's data to report[cite: 1] */}
          {attendance.length > 0 && (
            <DTRReportDialog groupedAttendance={sortedGrouped} />
          )}

          {/* Only show if there's data to report[cite: 1] */}
          {attendance.length > 0 && (
            <AccomplishmentReportDialog groupedAttendance={sortedGrouped} />
          )}

          <div className="hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm sm:flex">
            <History size={14} className="text-emerald-500" />
            {attendance.length} Total Sessions
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

      {attendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-100 bg-white py-20">
          <Calendar size={48} className="mb-4 text-slate-200" />
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            No records found yet
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedGrouped.map(([date, logs]) => {
            const chronologicalLogs = logs.sort((a, b) => {
              const toDateB = toDate(b.createdAt);
              const toDateA = toDate(a.createdAt);

              if (toDateB && toDateA)
                return toDateB.getTime() - toDateA.getTime();

              return -1;
            });

            return (
              <div key={date} className="group relative">
                {/* DATE SIDE-LABEL */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-800">
                      {date}
                    </h3>
                    <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                      {logs.length} Activity Entries
                    </p>
                  </div>
                </div>

                {/* TIMELINE STACK */}
                <div className="relative ml-5 space-y-4 border-l-2 border-slate-200 pb-4 pl-8">
                  {chronologicalLogs.map((rec, index) => {
                    const theme =
                      LOG_TYPE_THEME[rec.type] || LOG_TYPE_THEME["time-in"];

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedLog(rec);
                          setOpen(true);
                        }}
                        className="group/item relative flex cursor-pointer items-center justify-between rounded-3xl border border-white bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 active:scale-[0.98]"
                      >
                        {/* Timeline Dot Connector */}
                        <div
                          className={`absolute top-1/2 -left-[41px] h-4 w-4 -translate-y-1/2 rounded-full border-4 border-[#EDF2F0] bg-white ring-2 ${theme.ring} transition-transform group-hover/item:scale-125`}
                        />

                        <div className="flex items-center gap-6">
                          {/* Snapshot Thumbnail */}
                          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 shadow-inner">
                            <img
                              src={rec.image}
                              alt="auth"
                              className="h-full w-full object-cover transition-transform group-hover/item:scale-110"
                            />
                          </div>

                          {/* Content */}
                          <div>
                            <div className="mb-0.5 flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[9px] font-black tracking-widest uppercase ${theme.bg} ${theme.text}`}
                              >
                                {theme.label}
                              </span>
                              <EvaluationStatus log={rec} />
                            </div>
                            <p className="text-base font-black tracking-tight text-slate-800">
                              {
                                formatReadableDateTime(rec.createdAt).split(
                                  "at",
                                )[1]
                              }
                            </p>
                            <div className="flex items-center gap-1 text-slate-400">
                              <MapPin size={10} className="text-emerald-500" />
                              <span className="text-[9px] font-bold tracking-tighter uppercase">
                                Verified Coordinates
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right-side Indicator */}
                        <div className="hidden pr-4 sm:block">
                          <ArrowRight
                            size={18}
                            className="text-slate-200 transition-colors group-hover/item:text-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Internal Evaluation Status Component for Cleanliness
function EvaluationStatus({ log }: { log: Attendance }) {
  if (log.attribute) {
    const styles: Record<string, string> = {
      excused: "text-blue-500",
      tardy: "text-amber-500",
      absent: "text-rose-500",
    };
    return (
      <span
        className={`text-[9px] font-black uppercase ${styles[log.attribute] || "text-slate-400"}`}
      >
        {log.attribute}
      </span>
    );
  }
  return log.evaluated ? (
    <CheckCircle2 size={14} className="text-emerald-500" />
  ) : (
    <Timer size={14} className="text-slate-300" />
  );
}

export default AttendanceRecord;
