import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useCurrentUser } from "@saintrelion/auth-lib";
import type { InternInfo } from "@/models/InternInfo";
import type { Attendance } from "@/models/Attendance";
import type { User } from "@/models/User";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { RenderTable } from "@saintrelion/ui";
import { formatReadableDate, isSameDay } from "@saintrelion/time-functions";

interface InternTableRow {
  id: string;
  name: string;
  trainingCompany: string;
  remainingHours: string;
  requiredHours: string;
  attendanceStatus: string;
}

const columns: ColumnDef<InternTableRow>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Intern", accessorKey: "name" },
  { header: "Training site", accessorKey: "trainingCompany" },
  {
    header: "Progress",
    cell: ({ row }) => {
      const total = Number(row.original.requiredHours);
      const remaining = Number(row.original.remainingHours);
      const percent = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;
      return <span>{percent}%</span>;
    },
  },
  { header: "Required hours", accessorKey: "requiredHours" },
  { header: "Remaining hours", accessorKey: "remainingHours" },
  { header: "Selected day", accessorKey: "attendanceStatus" },
];

export default function InternTable({ selectedDate }: { selectedDate?: Date }) {
  const selectedDateAsString = selectedDate?.toDateString() ?? "";
  const user = useCurrentUser<User>();
  const { useList: getUsers } = useResourceLocked<User>("user");
  const { useList: getInternInfos } = useResourceLocked<InternInfo>("interninfo");
  const { useList: getAttendance } = useResourceLocked<Attendance>("attendance");

  const interns = getUsers({ filters: { role: "intern", department: user.department } }).data;
  const internInfos = getInternInfos().data;
  const attendance = getAttendance().data;

  const rows = useMemo(() => {
    const recorded = new Set(
      attendance
        .filter((log) => selectedDate && isSameDay(log.createdAt, selectedDateAsString))
        .map((log) => log.userId),
    );
    return interns.map((intern) => {
      const info = internInfos.find((item) => item.userId === intern.id);
      return {
        id: intern.id,
        name: `${intern.firstName} ${intern.lastName}`,
        trainingCompany: info?.trainingCompany ?? "—",
        remainingHours: info?.remainingHours ?? "0",
        requiredHours: info?.requiredHours ?? "0",
        attendanceStatus: recorded.has(intern.id) ? "Recorded" : "No record",
      };
    });
  }, [interns, internInfos, attendance, selectedDate, selectedDateAsString]);

  return (
    <div className="min-w-0 border border-[#152238]/12 bg-white p-5 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-[#152238]">
        Intern records {selectedDate && <span className="font-normal text-slate-500">· {formatReadableDate(selectedDateAsString)}</span>}
      </h3>
      <RenderTable
        data={rows}
        columns={columns}
        hiddenColumns={["id"]}
        filters={["trainingCompany"]}
        tableMinWidth={760}
        wrapperClassName="w-full min-w-0"
        tableClassName="w-full text-sm border-collapse"
      />
    </div>
  );
}
