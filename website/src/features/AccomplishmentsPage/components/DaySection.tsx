import { AccomplishmentCard } from "@/features/AccomplishmentsPage/components/AccomplishmentCard";
import type { Accomplishment } from "@/shared/model/Accomplishment";
import {
  formatReadableDate,
  getCurrentDateTimeString,
} from "@saintrelion/time-functions";
import { CalendarDays } from "lucide-react";

// ============================================================
// MARK: Day section
export function DaySection({
  date,
  items,
}: {
  date: string;
  items: Accomplishment[];
}) {
  const today = getCurrentDateTimeString().slice(0, 10);
  const isToday = date === today;

  return (
    <section className="border border-[#152238]/12 bg-white">
      <div className="flex items-center justify-between border-b border-[#152238]/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-[#1677ff]" />
          <span className="text-sm font-semibold text-[#152238]">
            {formatReadableDate(date)}
          </span>
          {isToday && (
            <span className="bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 uppercase">
              Today
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="divide-y divide-[#152238]/10">
        {items.map((item) => (
          <AccomplishmentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
