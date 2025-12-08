import { useEffect, useState } from "react";
import { Calendar } from "./ui/calendar";
import { isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

import InternTable from "./tables/interntable";
import type { OjtYearlyDateRange } from "@/models/ojt-yearly-range";
import { useDBOperationsLocked } from "@saintrelion/data-access-layer";

const OJTAttendanceTable = () => {
  // Default
  const currentYear = new Date().getFullYear();
  const currentSchoolYear = `${currentYear}-${currentYear + 1}`;
  // End

  const [selectedSchoolYear, setSelectedSchoolYear] =
    useState(currentSchoolYear);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [focusedMonth, setFocusedMonth] = useState<Date>();

  const { useSelect: ojtYearlyDateRangeSelect } =
    useDBOperationsLocked<OjtYearlyDateRange>("OjtYearlyDateRange");
  const { data: ranges } = ojtYearlyDateRangeSelect();

  const selectedRange = ranges?.find((r) => r.yearRange === selectedSchoolYear);

  const start =
    selectedRange?.start ?? new Date(new Date().getFullYear(), 0, 1); // Jan 1 of current year
  const end = selectedRange?.end ?? new Date(new Date().getFullYear(), 11, 31); // Dec 31 of current year

  useEffect(() => {
    if (selectedRange) {
      setSelectedDate(selectedRange.start);
      setFocusedMonth(selectedRange.start);
    }
  }, [selectedRange]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="rounded-xl bg-white p-4 shadow lg:col-span-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-md font-semibold">Select School Year</h2>
          <select
            value={selectedSchoolYear}
            onChange={(e) => setSelectedSchoolYear(e.target.value)}
            className="rounded-md border px-2 py-1 font-bold"
          >
            {ranges?.map((r) => (
              <option key={r.yearRange} value={r.yearRange}>
                {r.yearRange}
              </option>
            ))}
            <option value={currentSchoolYear}>Current</option>
          </select>
        </div>
        <Calendar
          className="w-full"
          selected={selectedDate}
          month={focusedMonth}
          onMonthChange={(month) => setFocusedMonth(month)}
          onDayClick={(date) => setSelectedDate(date)}
          // optional: disable out-of-range dates
          disabled={(date) =>
            isBefore(date, startOfDay(start)) || isAfter(date, endOfDay(end))
          }
        />
        <p className="mt-2 text-center text-xs text-gray-500">
          OJT Range: {start.toDateString()} → {end.toDateString()}
        </p>
      </div>

      {/* Student Table (Date-Synced) */}
      <div className="lg:col-span-3">
        <InternTable selectedDate={selectedDate} />
      </div>
    </div>
  );
};
export default OJTAttendanceTable;
