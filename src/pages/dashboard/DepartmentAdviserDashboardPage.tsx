import { useMemo } from "react";
import { RenderDataCore } from "@saintrelion/ui";
import OJTAttendanceTable from "@/components/OJTAttendanceTable";
import type { InternInfo } from "@/models/InternInfo";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { Users, Building2, LayoutDashboard } from "lucide-react";
import { Department } from "@/model_types/department";

interface StatItem {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend: string;
}

export function DepartmentAdviserDashboard() {
  const user = useCurrentUser<User>();

  // 1. DATA SELECTORS
  const { useList: getUsers } = useResourceLocked<User>("user");
  const { useList: getInternInfos } =
    useResourceLocked<InternInfo>("interninfo");

  const interns = getUsers({
    filters: {
      role: "intern",
      department: user.department,
    },
  }).data;
  const internInfos = getInternInfos().data;

  // 2. DERIVED ANALYTICS
  const stats: StatItem[] = useMemo(() => {
    // Calculate unique training companies for this department
    const departmentInternIds = new Set(interns.map((i) => i.id));
    const activeCompanies = new Set(
      internInfos
        .filter((info) => departmentInternIds.has(info.userId))
        .map((info) => info.trainingCompany),
    );

    return [
      {
        icon: <Users size={20} className="text-emerald-500" />,
        title: "Total Interns",
        value: interns.length,
        trend: "Active Trainees",
      },
      {
        icon: <Building2 size={20} className="text-blue-500" />,
        title: "Partner Sites",
        value: activeCompanies.size,
        trend: "Training Locations",
      },
    ];
  }, [interns, internInfos]);

  return (
    <div className="space-y-10 pb-20">
      {/* TERMINAL HEADER */}
      <div className="flex flex-col justify-between gap-6 border-b border-slate-200 px-2 pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          {/* Terminal Icon Box */}
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-slate-900 text-white shadow-2xl shadow-slate-200">
            <LayoutDashboard size={32} strokeWidth={1.5} />
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">
              Adviser <span className="text-emerald-600">Terminal</span>
            </h1>

            {/* HIGHLIGHTED DEPARTMENT SUBTITLE */}
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                {Department[user.department as keyof typeof Department]}
                <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[9px] text-slate-400">
                  Control Center
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRID: 2 Columns */}
      <RenderDataCore
        data={stats.filter((s) => s.title !== "Department")} // Remove the old department stat
        ui={{
          content: {
            wrapperClassName: "grid grid-cols-1 md:grid-cols-2 gap-6",
          },
        }}
        renderItem={(item: StatItem) => (
          <div className="group relative flex items-center gap-6 rounded-[3rem] border border-white bg-white p-8 shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.02] hover:shadow-emerald-900/10">
            {/* Larger Icon for 2-col layout */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border border-slate-100 bg-slate-50 shadow-inner transition-colors group-hover:bg-emerald-50">
              {item.icon}
            </div>

            <div>
              <p className="mb-1 text-[11px] font-black tracking-[0.25em] text-slate-400 uppercase">
                {item.title}
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black tracking-tighter text-slate-800">
                  {item.value}
                </p>
                <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  {item.trend}
                </span>
              </div>
            </div>

            {/* Subtle Background Glow on Hover */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2 text-slate-50 opacity-0 transition-opacity group-hover:opacity-100">
              {item.icon}
            </div>
          </div>
        )}
      />

      {/* MAIN DATA SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-4">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          <h2 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase">
            Live Attendance Monitor
          </h2>
        </div>

        <div className="overflow-hidden rounded-[3rem] border border-white bg-white p-2 shadow-2xl shadow-slate-200/40">
          <OJTAttendanceTable />
        </div>
      </div>
    </div>
  );
}
