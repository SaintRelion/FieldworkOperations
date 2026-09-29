import { useEffect, useState } from "react";
import { Calendar } from "./ui/calendar";
import { isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import InternTable from "./tables/interntable";
import type { OjtYearlyDateRange } from "@/models/OjtYearlyDateRange";
import { useResourceLocked } from "@saintrelion/data-access-layer";

const OJTAttendanceTable = () => {
  const currentYear = new Date().getFullYear();
  const currentSchoolYear = `${currentYear}-${currentYear + 1}`;
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(currentSchoolYear);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [focusedMonth, setFocusedMonth] = useState<Date>();
  const { useList: getOjtYearRanges } = useResourceLocked<OjtYearlyDateRange>("ojtyearlydaterange");
  const ranges = getOjtYearRanges().data;
  const selectedRange = ranges?.find((range) => range.yearRange === selectedSchoolYear);
  const start = selectedRange?.start ?? new Date(currentYear, 0, 1);
  const end = selectedRange?.end ?? new Date(currentYear, 11, 31);

  useEffect(() => {
    if (selectedRange) {
      setSelectedDate(selectedRange.start);
      setFocusedMonth(selectedRange.start);
    }
  }, [selectedRange]);

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="border border-[#152238]/12 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Select a day</h3>
          <select
            aria-label="School year"
            value={selectedSchoolYear}
            onChange={(event) => setSelectedSchoolYear(event.target.value)}
            className="border border-[#152238]/15 bg-white px-2 py-1.5 text-xs font-semibold"
          >
            {ranges?.map((range) => <option key={range.yearRange} value={range.yearRange}>{range.yearRange}</option>)}
            <option value={currentSchoolYear}>Current</option>
          </select>
        </div>
        <Calendar
          className="w-full"
          selected={selectedDate}
          month={focusedMonth}
          onMonthChange={setFocusedMonth}
          onDayClick={setSelectedDate}
          disabled={(date) => isBefore(date, startOfDay(start)) || isAfter(date, endOfDay(end))}
        />
        <p className="mt-3 border-t border-[#152238]/10 pt-3 text-xs text-slate-500">
          Range: {start.toDateString()} – {end.toDateString()}
        </p>
      </div>
      <InternTable selectedDate={selectedDate} />
    </div>
  );
};

export default OJTAttendanceTable;
