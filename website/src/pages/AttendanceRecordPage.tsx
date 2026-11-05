import DTRReportDialog from "@/features/AttendanceRecordPage/components/DTRReportDialog";
import { useAttendanceRecordPage } from "@/features/AttendanceRecordPage/hooks/useAttendanceRecordPage";
import { labels } from "@/features/AttendanceRecordPage/lib/attendance-labels";
import ViewAttendancePopup from "@/shared/components/ViewAttendancePopup";
import { attendanceOutcome, sessionAttendance } from "@/shared/lib/attendance";
import { formatReadableDateTime } from "@saintrelion/time-functions";
import { ArrowUpRight, CalendarDays, ImageOff } from "lucide-react";

export default function AttendanceRecordPage() {
  const {
    selectedLog,
    setSelectedLog,
    open,
    setOpen,
    attendanceQuery,
    attendance,
    grouped,
  } = useAttendanceRecordPage();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-5 border-b border-[#152238]/15 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">
            Intern / records
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">
            Attendance history
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            A dated record of your captured shifts and breaks.
          </p>
        </div>
        {attendance.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <DTRReportDialog groupedAttendance={grouped} />
          </div>
        )}
      </div>

      {selectedLog && (
        <ViewAttendancePopup
          record={sessionAttendance(
            attendance.find((log) => log.id === selectedLog.id) ?? selectedLog,
            attendance,
          )}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {grouped.length === 0 ? (
        <div className="border border-dashed border-[#152238]/20 bg-white px-6 py-14 text-center">
          <CalendarDays
            size={30}
            className="mx-auto mb-3 text-slate-400"
            aria-hidden="true"
          />
          <p className="text-base font-semibold text-[#152238]">
            No attendance records yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Your first recorded time in will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, logs]) => (
            <section key={date} className="border border-[#152238]/12 bg-white">
              <div className="flex items-center justify-between border-b border-[#152238]/10 px-5 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-[#152238]">
                  {date}
                </h2>
                <span className="text-xs text-slate-500">
                  {logs.length} {logs.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <div className="divide-y divide-[#152238]/10">
                {logs.map((log, index) => (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => {
                      setSelectedLog(log);
                      setOpen(true);
                      void attendanceQuery.refetch();
                    }}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f7f9fc] sm:px-6"
                  >
                    <span className="w-6 shrink-0 text-xs font-semibold text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="grid h-12 w-14 shrink-0 place-items-center overflow-hidden bg-slate-100">
                      {log.image ? (
                        <img
                          src={log.image}
                          alt="Attendance capture"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff
                          size={17}
                          className="text-slate-400"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#152238]">
                        {labels[log.type]}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {formatReadableDateTime(log.createdAt)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 px-2 py-1 text-xs font-semibold ${attendanceOutcome(sessionAttendance(log, logs)).className}`}
                    >
                      {attendanceOutcome(sessionAttendance(log, logs)).label}
                    </span>
                    <ArrowUpRight
                      size={17}
                      className="shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
