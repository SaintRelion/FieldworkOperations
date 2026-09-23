import { useMemo, useState } from "react";
import {
  Camera,
  History,
  CheckCircle2,
  Play,
  Coffee,
  LogOut,
  ArrowLeft,
  UserCircle,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";
import type { Attendance, CreateAttendance } from "@/models/Attendance";
import {
  formatReadableDateTime,
  getCurrentDateTimeString,
  isSameDay,
} from "@saintrelion/time-functions";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { GeoViewer } from "@/to-be-library/geo/geo-viewer";
import { LiveClock } from "@/to-be-library/live/live-clock";
import { CameraCapture } from "@/to-be-library/live/camera-capture";
import type { User } from "@/models/User";
import { sortByCreatedAt } from "@/lib/utils";
import ViewAttendancePopup from "@/components/ViewAttendancePopup";
import { toast } from "@saintrelion/notifications";

type AttendanceType = "time-in" | "break-out" | "break-in" | "time-out";

interface StepMeta {
  label: string;
  nextType: AttendanceType | null;
  color: string;
  icon: React.ReactNode;
}

export default function InternDashboardPage() {
  const user = useCurrentUser<User>();
  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const [isMapVisible, setIsMapVisible] = useState<boolean>(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 8.59002112678708,
    lng: 123.34123498443732,
  });

  const { useList: getAttendance, useInsert: insertAttendance } =
    useResourceLocked<Attendance, CreateAttendance>("attendance", {
      showToast: false,
    });

  const attendanceQuery = getAttendance({ filters: { userId: user.id } });
  const attendance = sortByCreatedAt(attendanceQuery.data, "desc");

  const currentStep = useMemo(() => {
    const today = getCurrentDateTimeString().slice(0, 10);
    const todaysLogs = attendance.filter((log: Attendance) =>
      isSameDay(today, log.createdAt),
    );
    if (todaysLogs.length === 0) return NEXT_STEP_LOGIC["none"];
    return NEXT_STEP_LOGIC[todaysLogs[0].type] || NEXT_STEP_LOGIC["time-out"];
  }, [attendance]);

  console.log(currentStep);

  const logAttendance = async (capture: () => string | null) => {
    if (!currentStep.nextType) return;
    await insertAttendance.run({
      userId: user.id,
      type: currentStep.nextType,
      location: [coords.lat, coords.lng],
      image: capture() ?? "",
      attribute: "",
      evaluated: false,
    });

    toast.success("Attendance Recorded");
  };

  return (
    <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12">
      {selectedLog && (
        <ViewAttendancePopup
          record={selectedLog}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {/* FLOATING MAP HUD - Cleaned up Overlays */}
      <div
        className={`fixed right-8 bottom-8 z-50 w-80 overflow-hidden rounded-[2.5rem] border border-white bg-white/90 shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-in-out ${isMapVisible ? "h-80 translate-y-0" : "h-14 translate-y-2"}`}
      >
        <div className="flex w-full items-center justify-between bg-slate-900/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-200">
              <Navigation size={14} fill="currentColor" />
            </div>
            <div>
              <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                Map Location
              </p>
              <p className="text-[10px] font-bold text-slate-700">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMapVisible(!isMapVisible)}
            className="rounded-full bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:text-emerald-500"
          >
            {isMapVisible ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        <div className="relative h-60 w-full p-2">
          <div className="h-full w-full overflow-hidden rounded-[1.8rem] border border-slate-100 shadow-inner">
            <GeoViewer
              onCoordinateChange={(c: { lat: number; lng: number }) => {
                setCoords(c);
              }}
              geoOptions={{
                mode: "track",
                externalCoords: isMapVisible ? undefined : coords,
              }}
            />
          </div>
        </div>
      </div>

      {/* LEFT: MAIN TERMINAL */}
      <div className="space-y-6 lg:col-span-7">
        <div className="relative overflow-hidden rounded-[3rem] border border-white bg-white p-10 shadow-xl shadow-slate-200/50">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                <UserCircle size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                  Authenticated Session
                </p>
                <h1 className="text-3xl font-black tracking-tighter text-slate-800">
                  {user.firstName}{" "}
                  <span className="text-emerald-500">{user.lastName}</span>
                </h1>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 px-6 py-4 text-white shadow-xl">
              <LiveClock />
            </div>
          </div>

          <CameraCapture>
            {({ capture, isCapturing }) => (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <button
                    disabled={isCapturing || !currentStep.nextType}
                    onClick={() => logAttendance(capture)}
                    className={`group flex w-full max-w-md items-center justify-between rounded-[2rem] p-2 transition-all active:scale-[0.96] disabled:opacity-30 ${currentStep.color} shadow-2xl shadow-slate-200`}
                  >
                    <div className="pl- flex items-center gap-4 px-4 text-white">
                      {currentStep.icon}
                      <span className="text-xl font-black tracking-tight">
                        {currentStep.label}
                      </span>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/20 bg-white/20 backdrop-blur-md">
                      <Camera className="text-white" size={28} />
                    </div>
                  </button>
                  {!currentStep.nextType && (
                    <p className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase">
                      Deployment Complete for {new Date().toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CameraCapture>
        </div>
      </div>

      {/* RIGHT: LOGS */}
      <div className="space-y-4 lg:col-span-5">
        <h2 className="flex items-center gap-2 px-4 text-xs font-black tracking-[0.3em] text-slate-500 uppercase">
          <History size={16} className="text-emerald-500" /> Session History
        </h2>
        <div className="custom-scrollbar max-h-[80vh] space-y-3 overflow-y-auto pr-2">
          {attendance.map((log) => (
            <div
              key={log.id}
              onClick={() => {
                setSelectedLog(log);
                setOpen(true);
              }}
              className="group flex cursor-pointer gap-4 rounded-[2.2rem] border border-white bg-white/60 p-4 backdrop-blur-sm transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/40"
            >
              <img
                src={log.image}
                alt="auth"
                className="h-16 w-16 rounded-2xl border border-slate-100 object-cover shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`rounded-md px-2 py-0.5 text-[8px] font-black tracking-widest uppercase ${log.type.includes("time") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {log.type.replace("-", " ")}
                </span>
                <p className="mt-1 text-sm font-black text-slate-800">
                  {formatReadableDateTime(log.createdAt)}
                </p>
                <p className="mt-1 truncate text-[9px] font-bold text-slate-400">
                  LOC: {log.location.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Data Mapping for the Logic
const NEXT_STEP_LOGIC: Record<string, StepMeta> = {
  none: {
    label: "Time In",
    nextType: "time-in",
    color: "bg-emerald-600",
    icon: <Play size={20} />,
  },
  "time-in": {
    label: "Break Out",
    nextType: "break-out",
    color: "bg-amber-500",
    icon: <Coffee size={20} />,
  },
  "break-out": {
    label: "Break In",
    nextType: "break-in",
    color: "bg-blue-500",
    icon: <ArrowLeft size={20} />,
  },
  "break-in": {
    label: "Time Out",
    nextType: "time-out",
    color: "bg-rose-600",
    icon: <LogOut size={20} />,
  },
  "time-out": {
    label: "Completed",
    nextType: null,
    color: "bg-slate-400",
    icon: <CheckCircle2 size={20} />,
  },
};
