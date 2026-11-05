import { DayCard } from "@/features/DepartmentAttendanceEvaluationPage/components/DayCard";
import { useDepartmentAttendanceEvaluationPage } from "@/features/DepartmentAttendanceEvaluationPage/hooks/useDepartmentAttendanceEvaluationPage";
import ViewAttendancePopup from "@/shared/components/ViewAttendancePopup";
import type { Attendance } from "@/shared/model/Attendance";
import { Settings as SettingsIcon } from "lucide-react";

export default function DepartmentAttendanceEvaluationPage() {
  const {
    user,
    navigate,
    selectedLog,
    setSelectedLog,
    open,
    setOpen,
    users,
    departmentSettings,
    grouped,
    handleMark,
  } = useDepartmentAttendanceEvaluationPage();

  // ============================================================
  // MARK: Shift settings check
  if (!departmentSettings) {
    return (
      <div className="mx-auto max-w-2xl border border-[#152238]/12 bg-white px-6 py-12 text-center sm:px-10">
        <SettingsIcon size={28} className="mx-auto mb-5 text-[#1677ff]" />
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#152238]">
          Set your shift hours first
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Attendance review needs your department’s start and end times to
          evaluate late entries.
        </p>
        <button
          onClick={() => navigate("/departmentadviser/settings")}
          className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[#1677ff] px-5 text-sm font-semibold text-white hover:bg-[#0864db]"
        >
          <SettingsIcon size={16} /> Open shift rules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-[#152238]/15 pb-7">
        <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">
          Adviser / review
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">
          Review attendance
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Check captured entries and apply the correct attendance outcome for{" "}
          {user.department}.
        </p>
      </div>

      {selectedLog && (
        <ViewAttendancePopup
          record={selectedLog}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([userId, dates]) => {
          const u = users.find((x) => x.id === userId);
          return (
            <section key={userId} className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-[#152238]/15 pb-3">
                <h2 className="text-lg font-semibold text-[#152238]">
                  {u?.firstName} {u?.lastName}
                </h2>
                <span className="text-xs text-slate-500">
                  {Object.keys(dates).length}{" "}
                  {Object.keys(dates).length === 1 ? "day" : "days"}
                </span>
              </div>

              <div className="space-y-4">
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
            </section>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <p className="border border-dashed border-[#152238]/20 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No attendance is available for review yet.
          </p>
        )}
      </div>
    </div>
  );
}
