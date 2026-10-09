import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Check, MapPin } from "lucide-react";
import type { Attendance, CreateAttendance } from "@/models/Attendance";
import { formatReadableDateTime, isToday } from "@saintrelion/time-functions";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { useCurrentUser } from "@/lib/AuthProvider";
import { GeoViewer } from "@/to-be-library/geo/geo-viewer";
import { LiveClock } from "@/to-be-library/live/live-clock";
import { CameraCapture } from "@/to-be-library/live/camera-capture";
import type { User } from "@/models/User";
import { sortByCreatedAt } from "@/lib/utils";
import { attendanceOutcome, sessionAttendance } from "@/lib/attendance";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import ViewAttendancePopup from "@/components/ViewAttendancePopup";
import { toast } from "@saintrelion/notifications";

type AttendanceType = "time-in" | "break-out" | "break-in" | "time-out";

const steps: { type: AttendanceType; label: string }[] = [
  { type: "time-in", label: "Time in" },
  { type: "break-out", label: "Break out" },
  { type: "break-in", label: "Break in" },
  { type: "time-out", label: "Time out" },
];

export default function InternDashboardPage() {
  const user = useCurrentUser<User>();
  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState({ lat: 8.59002112678708, lng: 123.34123498443732 });

  const { useList: getAttendance, useInsert: insertAttendance } =
    useResourceLocked<Attendance, CreateAttendance>("attendance", { showToast: false });
  const attendanceQuery = getAttendance({ filters: { userId: user.id } });
  useRefreshOnFocus(attendanceQuery.refetch);
  const attendance = sortByCreatedAt(attendanceQuery.data, "desc");

  const completedSteps = useMemo(() => {

    const todaysLogs = attendance.filter((log) => isToday(log.createdAt));
    return steps.filter((step) => todaysLogs.some((log) => log.type === step.type)).length;
  }, [attendance]);

  const nextStep = steps[completedSteps] ?? null;

  const logAttendance = async (capture: () => string | null) => {
    if (!nextStep || isSubmitting) return;
    const image = capture();
    if (!image) {
      toast.error("Camera is not ready yet. Please check camera access and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      await insertAttendance.run({
        userId: user.id,
        type: nextStep.type,
        location: [coords.lat, coords.lng],
        image,
        attribute: "",
        evaluated: false,
      });
      await attendanceQuery.refetch();
      toast.info(`${nextStep.label} recorded`);
    } catch {
      toast.error("Attendance could not be recorded. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {selectedLog && <ViewAttendancePopup record={sessionAttendance(attendance.find((log) => log.id === selectedLog.id) ?? selectedLog, attendance)} open={open} onOpenChange={setOpen} />}

      <div className="flex flex-col gap-5 border-b border-[#152238]/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">Intern / today</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">Your shift, {user.firstName}.</h1>
          <p className="mt-2 text-sm text-slate-600">Record each step of your day with a photo and location.</p>
        </div>
        <div className="border-l-4 border-[#f4b740] bg-[#09111f] px-5 py-3 text-white">
          <LiveClock />
        </div>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="min-w-0 border border-[#152238]/12 bg-white">
          <div className="flex items-center justify-between border-b border-[#152238]/10 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-slate-500 uppercase">Attendance capture</p>
              <h2 className="mt-1 text-lg font-semibold text-[#152238]">{nextStep ? `Next: ${nextStep.label}` : "Shift complete"}</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">{completedSteps} / 4 steps</span>
          </div>
          <div className="p-4 sm:p-6">
            <CameraCapture>
              {({ capture, isCapturing, isReady, error }) => (
                <div className="mt-5 w-full">
                  <button
                    type="button"
                    disabled={isCapturing || isSubmitting || !isReady || !nextStep}
                    onClick={() => logAttendance(capture)}
                    className="flex min-h-14 w-full items-center justify-between bg-[#1677ff] px-5 text-left text-sm font-semibold text-white transition-colors hover:bg-[#0864db] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <span>{isSubmitting ? "Recording..." : nextStep ? `Record ${nextStep.label}` : "All steps recorded"}</span>
                    {nextStep ? <Camera size={19} aria-hidden="true" /> : <Check size={19} aria-hidden="true" />}
                  </button>
                  {error && nextStep && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
                  {!error && !isReady && nextStep && <p className="mt-3 text-sm text-slate-500">Starting camera…</p>}
                  {!nextStep && <p className="mt-3 text-sm text-slate-600">Your attendance is complete for today.</p>}
                </div>
              )}
            </CameraCapture>
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="border border-[#152238]/12 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#152238]">Today’s sequence</h2>
            <ol className="mt-5 divide-y divide-[#152238]/10">
              {steps.map((step, index) => (
                <li key={step.type} className="flex items-center gap-4 py-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center text-xs font-bold ${index < completedSteps ? "bg-[#09111f] text-white" : index === completedSteps ? "bg-[#1677ff] text-white" : "bg-[#f4f1ea] text-slate-500"}`}>
                    {index < completedSteps ? <Check size={15} aria-hidden="true" /> : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-sm ${index === completedSteps ? "font-semibold text-[#152238]" : "text-slate-600"}`}>{step.label}</span>
                  <span className="ml-auto text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    {index < completedSteps ? "Recorded" : index === completedSteps ? "Next" : "Pending"}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="overflow-hidden border border-[#152238]/12 bg-white">
            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-[#152238]">Capture location</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} aria-hidden="true" /> {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
              </div>
            </div>
            <div className="h-56 border-t border-[#152238]/10">
              <GeoViewer onCoordinateChange={setCoords} geoOptions={{ mode: "track" }} />
            </div>
          </section>
        </div>
      </div>

      <section className="border-t border-[#152238]/15 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#152238]">Recent records</h2>
            <p className="mt-1 text-xs text-slate-500">Your latest attendance entries</p>
          </div>
          <Link to="/intern/attendancerecord" className="flex items-center gap-2 text-xs font-semibold text-[#0864db] hover:underline">View all <ArrowRight size={14} /></Link>
        </div>
        {attendance.length === 0 ? (
          <p className="border border-dashed border-[#152238]/20 bg-white px-5 py-8 text-sm text-slate-500">No attendance has been recorded yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {attendance.slice(0, 4).map((log) => (
              <button
                type="button"
                key={log.id}
                onClick={() => { setSelectedLog(log); setOpen(true); void attendanceQuery.refetch(); }}
                className="flex items-center gap-3 border border-[#152238]/10 bg-white p-3 text-left transition-colors hover:border-[#1677ff]/40 hover:bg-[#f7f9fc]"
              >
                <img src={log.image} alt="Attendance capture" className="h-12 w-12 shrink-0 object-cover" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold tracking-[0.12em] text-[#1677ff] uppercase">{log.type.replace("-", " ")}</span>
                  <span className="mt-1 block truncate text-xs text-slate-600">{formatReadableDateTime(log.createdAt)}</span>
                  <span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold ${attendanceOutcome(sessionAttendance(log, attendance)).className}`}>
                    {attendanceOutcome(sessionAttendance(log, attendance)).label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
