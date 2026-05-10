import type { Accomplishment } from "@/models/Accomplishment";
import {
  ImageOff,
  CheckCircle2,
  CalendarDays,
  FileText,
  Printer,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import React from "react";

import { formatReadableDate, toDate } from "@saintrelion/time-functions";

const formatShortDate = (dateStr: string) => {
  const d = toDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface AccomplishmentReportDialogProps {
  groupedAccomplishments: [string, Accomplishment[]][];
}

export const AccomplishmentReportDialog: React.FC<
  AccomplishmentReportDialogProps
> = ({ groupedAccomplishments }) => {
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  const reportData = React.useMemo(() => {
    if (!dateRange.from && !dateRange.to) return groupedAccomplishments;

    return groupedAccomplishments.filter(([dateStr]) => {
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

      let toTime = Infinity;
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
  }, [groupedAccomplishments, dateRange]);

  const rangeLabel = () => {
    if (dateRange.from && dateRange.to) {
      if (dateRange.from === dateRange.to)
        return formatShortDate(dateRange.from);
      return `${formatShortDate(dateRange.from)} — ${formatShortDate(dateRange.to)}`;
    }
    if (dateRange.from) return `From ${formatShortDate(dateRange.from)}`;
    if (dateRange.to) return `Up to ${formatShortDate(dateRange.to)}`;
    return "All Entries";
  };

  const totalEntries = reportData.reduce(
    (sum, [, items]) => sum + items.length,
    0,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-slate-200 transition-all hover:bg-emerald-600 active:scale-95">
          <FileText size={16} />
          Generate Report
        </button>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-[95vw] !max-w-6xl flex-row overflow-hidden rounded-[2rem] border-none bg-slate-200/60 p-0 shadow-2xl print:block print:h-auto print:w-full print:max-w-none print:overflow-visible print:bg-white print:shadow-none">
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

        {/* ── LEFT PANEL: Controls ── */}
        <div className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
          {/* Scrollable content */}
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
            {/* Panel header */}
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
                <FileText size={24} strokeWidth={1.5} />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tighter text-slate-800 uppercase">
                Report
              </h2>
              <p className="mt-1 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
                Accomplishment Summary
              </p>
            </div>

            {/* Date range filters */}
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
              <p className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
                Date Range
              </p>

              <div>
                <label className="mb-1.5 block text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  From
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  max={dateRange.to || undefined}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  To
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  min={dateRange.from || undefined}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {(dateRange.from || dateRange.to) && (
                <button
                  onClick={() => setDateRange({ from: "", to: "" })}
                  className="text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-rose-500"
                >
                  Clear Range
                </button>
              )}
            </div>

            {/* Summary stats */}
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
              <p className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
                Summary
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Days
                </span>
                <span className="text-2xl font-black text-slate-800">
                  {reportData.length}
                </span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  Entries
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {totalEntries}
                </span>
              </div>
            </div>
          </div>

          {/* Pinned print button */}
          <div className="shrink-0 border-t border-slate-100 p-6">
            <button
              onClick={() => window.print()}
              disabled={reportData.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-5 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL: Preview ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden print:block print:overflow-visible">
          {/* Preview header bar */}
          <div className="border-b border-slate-200 bg-white px-8 py-5 print:hidden">
            <p className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
              Preview
            </p>
            <p className="mt-0.5 text-sm font-black text-slate-700">
              {rangeLabel()} &middot; {reportData.length} day
              {reportData.length !== 1 ? "s" : ""} &middot; {totalEntries} entr
              {totalEntries !== 1 ? "ies" : "y"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-100/40 p-8 print:overflow-visible print:bg-white print:p-0">
            {/* Print document */}
            <div className="mx-auto max-w-3xl space-y-10 rounded-[2rem] bg-white p-10 shadow-sm print:rounded-none print:p-8 print:shadow-none">
              {/* Document header */}
              <div className="border-b border-slate-100 pb-8">
                <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">
                  OJT <span className="text-emerald-600">Accomplishment</span>{" "}
                  Report
                </h1>
                <p className="mt-2 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
                  {rangeLabel()} &middot; {totalEntries} total{" "}
                  {totalEntries === 1 ? "entry" : "entries"}
                </p>
              </div>

              {reportData.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <CalendarDays size={40} className="text-slate-300" />
                  <p className="mt-4 text-sm font-black tracking-widest text-slate-400 uppercase">
                    No entries in selected range
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {reportData.map(([date, items]) => (
                    <div key={date}>
                      {/* Day header */}
                      <div className="mb-5 flex items-center gap-3">
                        <CalendarDays size={14} className="text-slate-400" />
                        <span className="text-[11px] font-black tracking-widest text-slate-800 uppercase">
                          {formatReadableDate(date)}
                        </span>
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[9px] font-black text-slate-400">
                          {items.length}{" "}
                          {items.length === 1 ? "entry" : "entries"}
                        </span>
                      </div>

                      {/* Entry rows */}
                      <div className="space-y-3">
                        {items.map((item) => (
                          <ReportEntryRow key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {reportData.length > 0 && (
                <div className="border-t border-slate-100 pt-6 text-center">
                  <p className="text-[9px] font-black tracking-[0.3em] text-slate-300 uppercase">
                    Generated &middot;{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── REPORT ENTRY ROW ──────────────────────────────────────────────────────────
function ReportEntryRow({ item }: { item: Accomplishment }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100">
        {item.image ? (
          <img
            src={item.image}
            alt="accomplishment"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <ImageOff size={16} />
          </div>
        )}
      </div>

      <div className="flex flex-1 items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-slate-700">
          {item.description}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase">
            Done
          </span>
        </div>
      </div>
    </div>
  );
}
