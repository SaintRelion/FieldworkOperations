import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useAuth } from "@saintrelion/auth-lib";
import type { InternInfo } from "@/models/intern-info";
import type { AttendanceLog } from "@/models/attendance";
import type { User } from "@/models/user";
import { useDBOperations } from "@saintrelion/data-access-layer";
import { RenderTable } from "@saintrelion/ui";
import { formatReadableDate, isSameDay } from "@saintrelion/time-functions";

const columns: ColumnDef<InternTableRow>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Program", accessorKey: "program" },
  { header: "Training Company", accessorKey: "trainingCompany" },
  {
    header: "Progress",
    cell: ({ row }) => {
      const { remainingHours, requiredHours } = row.original;
      const total = requiredHours;
      const percent = Math.round(((total - remainingHours) / total) * 100);
      return <span>{percent}%</span>;
    },
  },
  {
    header: "Required Hours",
    accessorKey: "requiredHours",
  },
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
  id: string;
  name: string;
  email: string;
  program: string;
  schoolYear: string;
  trainingCompany: string;
  remainingHours: number;
  requiredHours: number;
  accomplished: boolean;
}

export default function InternTable({ selectedDate }: { selectedDate?: Date }) {
  const selectedDateAsString = selectedDate?.toDateString() ?? "";
  const { user } = useAuth();

  const { useSelect: userSelect } = useDBOperations<User>("User");
  const { useSelect: internInfoSelect } =
    useDBOperations<InternInfo>("InternInfo");
  const { useSelect: attendanceSelect } =
    useDBOperations<AttendanceLog>("AttendanceLog");

  const { data: interns = [] } = userSelect({
    mockOptions: {
      filterFn: (u) => u.role === "intern" && u.department === user.department,
    },
    firebaseOptions: {
      filterField: ["role", "department"],
      value: ["intern", user?.department],
      // sort: { field: "createdAt", direction: "desc" },
    },
  });

  const { data: internInfos = [] } = internInfoSelect();
  const { data: attendanceLogs = [] } = attendanceSelect();

  const internTableData: InternTableRow[] = useMemo(() => {
    return interns.map((intern) => {
      const info = internInfos.find((i) => i.userId === intern.id);
      return {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        program: info?.program ?? "-",
        schoolYear: info?.schoolYear ?? "-",
        trainingCompany: info?.trainingCompany ?? "-",
        remainingHours: info?.remainingHours ?? 0,
        requiredHours: info?.requiredHours ?? 0,
        accomplished: info?.accomplished ?? false,
      };
    });
  }, [interns, internInfos]);

  const logsForDay = selectedDate
    ? attendanceLogs.filter((attendance) =>
        isSameDay(attendance.createdAt, selectedDateAsString),
      )
    : [];

  const attendanceSet = new Set(logsForDay.map((log) => log.userID));

  return (
    <div className="mt-6 rounded-xl bg-white p-4 shadow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Student List{" "}
          {selectedDate != null &&
            `(${formatReadableDate(selectedDateAsString)}) - Attendance`}
        </h2>
      </div>

      <RenderTable
        data={internTableData}
        columns={columns}
        hiddenColumns={["id"]}
        filters={["program", "trainingCompany"]}
        tableMinWidth={1000}
        dataRowSpecialClassName={(row) => {
          return attendanceSet.has(row.original.id)
            ? "bg-green-200"
            : "hover:bg-gray-100";
        }}
      />
    </div>
  );
}
