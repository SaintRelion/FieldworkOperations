import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer, Settings2, Calendar } from "lucide-react";
import type { Attendance } from "@/models/Attendance";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { toDate } from "@saintrelion/time-functions";

interface DTRReportDialogProps {
  groupedAttendance: [string, Attendance[]][];
}

const DTRReportDialog: React.FC<DTRReportDialogProps> = ({
  groupedAttendance,
}) => {
  const user = useCurrentUser<User>();
  const fullName = `${user.firstName} ${user.lastName}`.toUpperCase();

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const formatDateInput = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [dateRange, setDateRange] = useState({
    from: formatDateInput(firstDay),
    to: formatDateInput(lastDay),
  });

  const attendanceMap = useMemo(() => {
    const map: Record<string, Attendance[]> = {};
    groupedAttendance.forEach(([_, logs]) => {
      console.log(_);
      logs.forEach((log) => {
        const d = toDate(log.createdAt);

        if (d && !isNaN(d.getTime())) {
          const key = formatDateInput(d);
          if (!map[key]) map[key] = [];
          map[key].push(log);
        }
      });
    });
    return map;
  }, [groupedAttendance]);

  // FIX: Updated to include AM/PM natively using toLocaleTimeString
  const extractTime = (createdAt?: string) => {
    if (!createdAt) return "";
    const d = toDate(createdAt);

    if (!d || isNaN(d.getTime())) return "";

    // Outputs format like "7:20 AM" or "5:00 PM"
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMonthRangeLabel = () => {
    if (!dateRange.from) return "";
    const [fy, fm, fd] = dateRange.from.split("-");
    const [ty, tm, td] = dateRange.to ? dateRange.to.split("-") : [fy, fm, fd];

    const fromDate = new Date(Number(fy), Number(fm) - 1, Number(fd));
    const toDate = new Date(Number(ty), Number(tm) - 1, Number(td));

    const monthName = fromDate
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();

    if (fy === ty && fm === tm) {
      if (fd === td) return `${monthName}. ${Number(fd)}, ${fy}`;
      return `${monthName}. ${Number(fd)}-${Number(td)}, ${fy}`;
    }
    return `${monthName}. ${Number(fd)} - ${toDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}. ${Number(td)}, ${ty}`;
  };

  const DtrForm = () => (
    <div className="mx-auto w-full max-w-[400px] bg-white font-sans text-black print:max-w-none">
      <div className="mb-2 text-center">
        <p className="font-serif text-[10px] italic">
          Civil Service Form No. 48
        </p>
        <h2 className="mt-1 text-sm font-black tracking-wide">
          DAILY TIME RECORD
        </h2>

        <div className="mx-auto mt-4 w-4/5 border-b border-black pb-0.5">
          <p className="text-xs font-bold tracking-widest">{fullName}</p>
        </div>
        <p className="mt-0.5 text-[9px] uppercase">(Name)</p>
      </div>

      <div className="mb-2 flex items-end justify-between px-2 text-[10px]">
        <span>FOR THE MONTH OF:</span>
        <span className="min-w-[140px] border-b border-black px-2 pb-0.5 text-center font-bold tracking-widest">
          {getMonthRangeLabel()}
        </span>
      </div>

      <div className="mb-2 px-2 text-[10px]">
        <p className="italic">Office hours for arrival and departure:</p>
        <div className="mt-1 flex justify-between pr-10 pl-4">
          <span>Regular:</span>
          <span className="inline-block w-32 border-b border-black"></span>
        </div>
        <div className="mt-1 flex justify-between pr-10 pl-4">
          <span>Saturdays:</span>
          <span className="inline-block w-32 border-b border-black"></span>
        </div>
      </div>

      <table className="w-full table-fixed border-collapse border-2 border-black text-center text-[10px]">
        <thead>
          <tr>
            <th className="w-8 border border-black font-normal" rowSpan={2}>
              Day
            </th>
            <th className="border border-black font-normal" colSpan={2}>
              AM
            </th>
            <th className="border border-black font-normal" colSpan={2}>
              PM
            </th>
            <th className="border border-black font-normal" colSpan={2}>
              Undertime
            </th>
          </tr>
          <tr>
            <th className="w-12 border border-black py-1 font-normal">
              Arrival
            </th>
            <th className="w-12 border border-black py-1 font-normal">
              Departure
            </th>
            <th className="w-12 border border-black py-1 font-normal">
              Arrival
            </th>
            <th className="w-12 border border-black py-1 font-normal">
              Departure
            </th>
            <th className="w-8 border border-black py-1 font-normal">Hours</th>
            <th className="w-8 border border-black py-1 font-normal">Min.</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 31 }).map((_, i) => {
            const dayOfMonth = i + 1;

            const [year, month] = (
              dateRange.from || formatDateInput(new Date())
            ).split("-");
            const rowDate = new Date(
              Number(year),
              Number(month) - 1,
              dayOfMonth,
            );

            const isValidMonthDate = rowDate.getMonth() === Number(month) - 1;

            let showWeekend = false;
            let dayOfWeek = 0;
            let timeIn, breakOut, breakIn, timeOut;

            if (isValidMonthDate) {
              dayOfWeek = rowDate.getDay();
              showWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              const fromBoundary = new Date(`${dateRange.from}T00:00:00`);
              const toBoundary = dateRange.to
                ? new Date(`${dateRange.to}T23:59:59`)
                : new Date(8640000000000000);
              const isWithinRange =
                rowDate >= fromBoundary && rowDate <= toBoundary;

              if (isWithinRange) {
                const key = formatDateInput(rowDate);
                const logs = attendanceMap[key] || [];

                timeIn = logs.find((l) => l.type === "time-in")?.createdAt;
                breakOut = logs.find((l) => l.type === "break-out")?.createdAt;
                breakIn = logs.find((l) => l.type === "break-in")?.createdAt;
                timeOut = logs.find((l) => l.type === "time-out")?.createdAt;
              }
            }

            return (
              <tr key={dayOfMonth} className="h-[22px]">
                <td className="border border-black font-bold">
                  {isValidMonthDate ? dayOfMonth : ""}
                </td>

                {showWeekend ? (
                  <td
                    className="border border-black font-bold tracking-widest text-slate-700 uppercase"
                    colSpan={6}
                  >
                    {dayOfWeek === 0 ? "Sunday" : "Saturday"}
                  </td>
                ) : (
                  <>
                    {/* Shrunk text to 9px and added whitespace-nowrap to fit the new AM/PM text without wrapping */}
                    <td className="border border-black px-0.5 text-[9px] font-semibold whitespace-nowrap">
                      {extractTime(timeIn)}
                    </td>
                    <td className="border border-black px-0.5 text-[9px] font-semibold whitespace-nowrap">
                      {extractTime(breakOut)}
                    </td>
                    <td className="border border-black px-0.5 text-[9px] font-semibold whitespace-nowrap">
                      {extractTime(breakIn)}
                    </td>
                    <td className="border border-black px-0.5 text-[9px] font-semibold whitespace-nowrap">
                      {extractTime(timeOut)}
                    </td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                  </>
                )}
              </tr>
            );
          })}
          <tr className="h-[22px] font-bold">
            <td className="border border-black pr-2 text-right" colSpan={5}>
              TOTAL
            </td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 text-justify font-serif text-[10px] leading-tight">
        <p className="indent-6">
          I CERTIFY on my honor that the above is a true and correct report of
          the hours of work performed, record of which was made daily at the
          time of arrival and departure from office.
        </p>
      </div>

      <div className="mx-auto mt-8 w-4/5 border-b border-black"></div>

      <div className="mt-4 text-[10px]">
        <p className="font-serif italic">
          Verified as to the prescribed office hours:
        </p>
        <div className="mt-8 w-full border-b border-black pb-0.5 text-center">
          <p className="leading-none font-bold tracking-widest uppercase">
            Supervisor Signature
          </p>
        </div>
        <p className="mt-1 text-center text-[9px] tracking-widest uppercase">
          In Charge
        </p>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95">
          <Calendar size={16} />
          <span>Generate DTR</span>
        </button>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-[95vw] !max-w-7xl flex-row overflow-hidden rounded-[2rem] border-none bg-slate-200/60 p-0 shadow-2xl print:block print:h-auto print:w-full print:max-w-none print:overflow-visible print:bg-white print:shadow-none">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            div[role="dialog"] > button[type="button"],
            [data-radix-dialog-content] > button {
              display: none !important;
            }
            @page { margin: 0.5cm; }
          }
        `,
          }}
        />

        {/* LEFT COLUMN: PREVIEW AREA */}
        <div className="flex flex-1 justify-center overflow-y-auto p-8 print:block print:overflow-visible print:p-0">
          <div className="mb-8 h-full min-h-[1256px] w-full max-w-[950px] bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-12 print:m-0 print:min-h-0 print:max-w-none print:p-0 print:shadow-none print:ring-0">
            <div className="flex h-full justify-center print:grid print:grid-cols-2 print:items-start print:gap-8">
              <DtrForm />
              <div className="hidden print:block">
                <DtrForm />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROL PANEL */}
        <div className="z-10 flex h-full w-[360px] shrink-0 flex-col border-l border-slate-200 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] print:hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 p-6">
            <div className="mb-1 flex items-center gap-2 text-slate-600">
              <Settings2 size={16} />
              <h2 className="text-[10px] font-black tracking-widest uppercase">
                DTR Settings
              </h2>
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-slate-800">
              Form Configuration
            </DialogTitle>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Select Range
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all outline-none focus:border-slate-900"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all outline-none focus:border-slate-900"
                  />
                </div>
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] leading-tight font-bold text-slate-500 italic">
                    Note: A Civil Service DTR prints exactly 31 days. Time logs
                    will only be populated for the dates selected in this range.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-white p-6">
            <button
              onClick={() => window.print()}
              disabled={!dateRange.from}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-5 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Printer size={20} />
              Print DTR (2 Copies)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DTRReportDialog;
