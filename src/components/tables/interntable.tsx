import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@saintrelion/auth-lib";
import { useMockSelect } from "@saintrelion/data-access-layer";
import type { InternInfo } from "@/models/intern-info";
import type { AttendanceLog } from "@/models/attendance";
import type { BaseUser } from "@/models/users";

const columns: ColumnDef<InternTableRow>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Program", accessorKey: "program" },
  { header: "Company", accessorKey: "company" },
  {
    header: "Progress",
    cell: ({ row }) => {
      const { remainingHours, requiredHours } = row.original;
      const total = requiredHours;
      const percent = Math.round(((total - remainingHours) / total) * 100);
      return <span>{percent}%</span>;
    },
  },
  { header: "Required Hours", accessorKey: "requiredHours" },
  { header: "Remaining Hours", accessorKey: "remainingHours" },
  {
    header: "Accomplished",
    cell: ({ row }) => (
      <span
        className={
          row.original.accomplished ? "text-green-600" : "text-red-500"
        }
      >
        {row.original.accomplished ? "Yes" : "No"}
      </span>
    ),
  },
];

interface InternTableRow {
  id: number;
  name: string;
  email: string;
  program: string;
  schoolYear: string;
  company: string;
  remainingHours: number;
  requiredHours: number;
  accomplished: boolean;
}

export default function InternTable({ selectedDate }: { selectedDate?: Date }) {
  const { user } = useAuth();

  const [programFilter, setProgramFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  const { data: interns = [] } = useMockSelect<BaseUser>("Users", {
    filterFn: (u) => u.role === "intern" && u.department === user.department,
  });
  const { data: internInfos = [] } = useMockSelect<InternInfo>("InternInfos");
  const { data: attendanceLogs = [] } =
    useMockSelect<AttendanceLog>("AttendanceLogs");

  const internTableData: InternTableRow[] = useMemo(() => {
    return interns.map((intern) => {
      const info = internInfos.find((i) => i.userId === intern.id);
      return {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        program: info?.program ?? "-",
        schoolYear: info?.schoolYear ?? "-",
        company: info?.company ?? "-",
        remainingHours: info?.remainingHours ?? 0,
        requiredHours: info?.requiredHours ?? 0,
        accomplished: info?.accomplished ?? false,
      };
    });
  }, [interns, internInfos]);

  const filteredData = useMemo(
    () =>
      internTableData.filter((student) => {
        const matchProgram =
          programFilter === "all" || student.program === programFilter;
        const matchCompany =
          companyFilter === "all" || student.company === companyFilter;
        return matchProgram && matchCompany;
      }),
    [internTableData, programFilter, companyFilter],
  );

  const table = useReactTable({
    data: filteredData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const logsForDay = selectedDate
    ? attendanceLogs.filter(
        (attendance) =>
          format(new Date(attendance.timeDateISO), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd"),
      )
    : [];

  const attendanceSet = new Set(logsForDay.map((log) => log.userID));

  return (
    <div className="mt-6 rounded-xl bg-white p-4 shadow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Student List{" "}
          {selectedDate != null &&
            `(${format(selectedDate, "MMMM d")}) - Attendance`}
        </h2>
        <div className="flex gap-2">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-md border px-3 py-1 text-sm"
          >
            <option value="all">All Programs</option>
            <option value="BSIT">BSIT</option>
            <option value="BSBA">BSBA</option>
          </select>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-md border px-3 py-1 text-sm"
          >
            <option value="all">All Companys</option>
            <option value="Accenture">Accenture</option>
            <option value="Smart Telecom">Smart Telecom</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isPresent = attendanceSet.has(row.original.id);
              return (
                <tr
                  key={row.id}
                  className={`border-b ${
                    isPresent ? "bg-green-200" : "hover:bg-gray-100"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="mt-4 text-center text-gray-500">
            No matching students.
          </p>
        )}
      </div>
    </div>
  );
}
