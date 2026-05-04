import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Printer,
  Settings2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Attendance } from "@/models/Attendance";
import { formatReadableDateTime, toDate } from "@saintrelion/time-functions";

interface AccomplishmentReportDialogProps {
  groupedAttendance: [string, Attendance[]][];
}

const EXPECTED_LOGS = ["time-in", "break-out", "break-in", "time-out"];

const AccomplishmentReportDialog: React.FC<AccomplishmentReportDialogProps> = ({
  groupedAttendance,
}) => {
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  const reportData = React.useMemo(() => {
    if (!dateRange.from && !dateRange.to) return groupedAttendance;

    return groupedAttendance.filter(([dateStr]) => {
      const refDate = toDate(dateStr);
      if (!refDate) return false;

      refDate.setHours(0, 0, 0, 0);
      const refTime = refDate.getTime();

      let fromTime = 0;
      if (dateRange.from) {
        const [year, month, day] = dateRange.from.split("-");
        fromTime = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          0,
          0,
          0,
          0,
        ).getTime();
      }

      let toTime = 8640000000000000;
      if (dateRange.to) {
        const [year, month, day] = dateRange.to.split("-");
        toTime = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          23,
          59,
          59,
          999,
        ).getTime();
      }

      return refTime >= fromTime && refTime <= toTime;
    });
  }, [groupedAttendance, dateRange]);

  // Helper to dynamically format the date range text for the header
  const getRangeLabel = () => {
    if (!dateRange.from && !dateRange.to) return "Full Record";

    const formatShortDate = (dateString: string) => {
      const [year, month, day] = dateString.split("-");
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (dateRange.from && dateRange.to) {
      // FIX: Check if the dates are identical to prevent redundant ranges
      if (dateRange.from === dateRange.to) {
        return formatShortDate(dateRange.from);
      }
      return `${formatShortDate(dateRange.from)} — ${formatShortDate(dateRange.to)}`;
    }
    if (dateRange.from) return `From ${formatShortDate(dateRange.from)}`;
    if (dateRange.to) return `Up to ${formatShortDate(dateRange.to)}`;

    return "Custom Range";
  };

  const getTypeStyles = (type: string) => {
    if (type === "break-out" || type === "break-in") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95">
          <FileText size={16} />
          <span>Generate Accomplishment Report</span>
        </button>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-[95vw] !max-w-7xl flex-row overflow-hidden rounded-[2rem] border-none bg-slate-200/60 p-0 shadow-2xl print:block print:h-auto print:w-full print:max-w-none print:overflow-visible print:bg-white print:shadow-none">
        {/* NUCLEAR CSS HACK: Targets Shadcn/Radix specific button structures to force them to hide on print */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            div[role="dialog"] > button[type="button"],
            [data-radix-dialog-content] > button,
            button.absolute.right-4.top-4 {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }
          }
        `,
          }}
        />

        {/* ========================================================= */}
        {/* LEFT COLUMN: THE PDF PREVIEW AREA */}
        {/* ========================================================= */}
        <div className="relative flex flex-1 justify-center overflow-y-auto p-8 print:block print:overflow-visible print:p-0">
          <div className="mb-8 min-h-[1056px] w-full max-w-[900px] bg-white p-12 shadow-xl ring-1 ring-slate-200 sm:p-16 print:m-0 print:min-h-0 print:max-w-none print:p-0 print:shadow-none print:ring-0">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b-4 border-slate-900 pb-6 print:mb-4 print:border-b-2 print:pb-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase print:text-2xl">
                  Activity Log
                </h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase print:text-[8px]">
                  Internship Documentation
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black tracking-widest text-emerald-600 uppercase print:text-[9px]">
                  {getRangeLabel()}
                </p>
                <p className="mt-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase print:hidden">
                  Preview Mode
                </p>
              </div>
            </div>

            {/* Document Body - Compact Table Format */}
            <div className="space-y-6 print:space-y-4">
              {reportData.map(([date, logs]) => (
                <div
                  key={date}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white print:break-inside-avoid print:rounded-md print:border-slate-300"
                >
                  {/* Date Table Header */}
                  <div className="bg-slate-900 px-4 py-2 print:bg-slate-800 print:py-1.5">
                    <span className="text-xs font-black tracking-widest text-white uppercase print:text-[9px]">
                      {date}
                    </span>
                  </div>

                  {/* The Highly Compact Table */}
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[9px] font-black tracking-widest text-slate-400 uppercase print:text-[7px]">
                      <tr>
                        <th className="w-24 px-3 py-2 print:w-16 print:px-2 print:py-1">
                          Evidence
                        </th>
                        <th className="w-32 px-3 py-2 print:w-24 print:px-2 print:py-1">
                          Log Type
                        </th>
                        <th className="px-3 py-2 print:px-2 print:py-1">
                          Timestamp
                        </th>
                        <th className="px-3 py-2 text-right print:px-2 print:py-1">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                      {logs.length > 0 ? (
                        EXPECTED_LOGS.map((expectedType) => {
                          const foundLog = logs.find(
                            (l) => l.type === expectedType,
                          );

                          if (foundLog) {
                            /* VERIFIED ROW */
                            return (
                              <tr
                                key={expectedType}
                                className="transition-colors hover:bg-slate-50/50"
                              >
                                <td className="px-3 py-1.5 print:px-2 print:py-1">
                                  <div className="h-10 w-14 overflow-hidden rounded-md border border-slate-200 bg-slate-100 print:h-8 print:w-12">
                                    <img
                                      src={foundLog.image}
                                      alt={foundLog.type}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-1.5 print:px-2 print:py-1">
                                  <span
                                    className={`w-fit rounded border px-2 py-0.5 text-[9px] font-black tracking-widest uppercase print:px-1 print:py-[1px] print:text-[6px] ${getTypeStyles(foundLog.type)}`}
                                  >
                                    {foundLog.type.replace("-", " ")}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 print:px-2 print:py-1">
                                  <span className="text-sm font-black text-slate-800 print:text-xs">
                                    {
                                      formatReadableDateTime(
                                        foundLog.createdAt,
                                      ).split("at")[1]
                                    }
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-right print:px-2 print:py-1">
                                  <div className="flex items-center justify-end gap-1">
                                    <CheckCircle2
                                      size={12}
                                      className="text-emerald-500 print:h-2.5 print:w-2.5"
                                    />
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase print:text-[7px]">
                                      Logged
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          } else {
                            /* MISSING ROW */
                            return (
                              <tr
                                key={expectedType}
                                className="bg-rose-50/30 print:bg-rose-50/50"
                              >
                                <td className="px-3 py-1.5 print:px-2 print:py-1">
                                  <div className="flex h-10 w-14 items-center justify-center rounded-md border border-dashed border-rose-200 bg-rose-50/50 print:h-8 print:w-12">
                                    <span className="text-[6px] font-black tracking-widest text-rose-300 uppercase print:text-[5px]">
                                      No Media
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-1.5 print:px-2 print:py-1">
                                  <span className="text-[9px] font-black tracking-widest text-rose-800 uppercase print:text-[7px]">
                                    {expectedType.replace("-", " ")}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 print:px-2 print:py-1">
                                  <span className="text-xs font-bold text-slate-300 print:text-[9px]">
                                    -- : --
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-right print:px-2 print:py-1">
                                  <span className="inline-block rounded border border-rose-200 bg-white px-1.5 py-0.5 text-[8px] font-bold tracking-widest text-rose-500 uppercase shadow-sm print:text-[6px]">
                                    Missing
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                        })
                      ) : (
                        /* FULL ABSENT DAY */
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-4 text-center print:py-2"
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              <AlertCircle
                                size={18}
                                className="text-rose-300 print:h-3 print:w-3"
                              />
                              <span className="text-[10px] font-black tracking-widest text-rose-800 uppercase print:text-[8px]">
                                Absent
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Empty State */}
              {reportData.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    No records found in this date range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CONTROL PANEL (Hidden on Print) */}
        {/* ========================================================= */}
        <div className="z-10 flex h-full w-[360px] shrink-0 flex-col border-l border-slate-200 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] print:hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 p-6">
            <div className="mb-1 flex items-center gap-2 text-emerald-600">
              <Settings2 size={16} />
              <h2 className="text-[10px] font-black tracking-widest uppercase">
                Report Settings
              </h2>
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-slate-800">
              Configuration
            </DialogTitle>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Filter By Date Range
              </label>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                    min={dateRange.from}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {(dateRange.from || dateRange.to) && (
                  <button
                    onClick={() => setDateRange({ from: "", to: "" })}
                    className="mt-2 w-full text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-slate-600"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Generated On
              </p>
              <p className="text-sm font-bold text-slate-700">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-white p-6">
            <button
              onClick={() => window.print()}
              disabled={reportData.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-5 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Printer size={20} />
              Print Report
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccomplishmentReportDialog;
