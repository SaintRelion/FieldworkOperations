import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarDays, Users } from "lucide-react";
import OJTAttendanceTable from "@/components/OJTAttendanceTable";
import type { InternInfo } from "@/models/InternInfo";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { Department } from "@/model_types/department";

export function DepartmentAdviserDashboard() {
  const user = useCurrentUser<User>();
  const { useList: getUsers } = useResourceLocked<User>("user");
  const { useList: getInternInfos } = useResourceLocked<InternInfo>("interninfo");
  const interns = getUsers({ filters: { role: "intern", department: user.department } }).data;
  const internInfos = getInternInfos().data;

  const siteCount = useMemo(() => {
    const ids = new Set(interns.map((intern) => intern.id));
    return new Set(
      internInfos
        .filter((info) => ids.has(info.userId) && info.trainingCompany)
        .map((info) => info.trainingCompany),
    ).size;
  }, [interns, internInfos]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 border-b border-[#152238]/15 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">Adviser / overview</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">Attendance at a glance.</h1>
          <p className="mt-2 text-sm text-slate-600">
            {Department[user.department as keyof typeof Department] ?? user.department} · Review records and keep training on track.
          </p>
        </div>
        <Link to="/departmentadviser/attendance" className="inline-flex min-h-11 items-center justify-between gap-6 bg-[#1677ff] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0864db]">
          Review attendance <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-px border border-[#152238]/12 bg-[#152238]/12 sm:grid-cols-2">
        <Link to="/departmentadviser/interns" className="group flex items-center justify-between bg-white p-5 transition-colors hover:bg-[#f7f9fc] sm:p-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] text-slate-500 uppercase">Assigned interns</p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-[#152238]">{interns.length}</p>
            <p className="mt-1 text-xs text-slate-500">View intern directory</p>
          </div>
          <Users size={27} className="text-[#a45b00]" aria-hidden="true" />
        </Link>
        <div className="flex items-center justify-between bg-white p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] text-slate-500 uppercase">Training sites</p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-[#152238]">{siteCount}</p>
            <p className="mt-1 text-xs text-slate-500">Sites linked to your interns</p>
          </div>
          <Building2 size={27} className="text-[#6d45bd]" aria-hidden="true" />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[#1677ff] uppercase"><CalendarDays size={14} aria-hidden="true" /> Daily monitor</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#152238]">Attendance by date</h2>
            <p className="mt-1 text-sm text-slate-600">Choose a day to see recorded activity for your interns.</p>
          </div>
        </div>
        <OJTAttendanceTable />
      </section>
    </div>
  );
}
