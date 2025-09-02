import InternTable from "@/components/tables/interntable";
import { Calendar } from "@/components/ui/calendar";
import type { BaseUser } from "@/models/users";
import { useAuth } from "@saintrelion/auth-lib";
import { useMockSelect } from "@saintrelion/data-access-layer";
import { UserPlus, Users } from "lucide-react";
import { useState } from "react";

export function DepartmentAdminDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { data: currentUser } = useMockSelect<BaseUser>("Users", {
    filterFn: (u) => u.id === user.id,
  });

  const adminDept = currentUser?.[0]?.department;
  // 👩‍🏫 Advisers filtered by department
  const { data: advisers = [] } = useMockSelect<BaseUser>("Users", {
    filterFn: (u) => u.role === "adviser" && u.department === adminDept,
  });

  // 👩‍🎓 Interns filtered by department
  const { data: interns = [] } = useMockSelect<BaseUser>("Users", {
    filterFn: (u) => u.role === "intern" && u.department === adminDept,
  });

  if (!adminDept) return <div>Department not Found, this shouldn't happen</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Department Admin Dashboard ({adminDept})
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center space-x-4 rounded-2xl bg-white p-4 shadow">
          <Users className="h-10 w-10 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total Advisers</p>
            <p className="text-lg font-semibold">{advisers.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 rounded-2xl bg-white p-4 shadow">
          <UserPlus className="h-10 w-10 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-lg font-semibold">{interns.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="space-y-6 p-6">
        {/* Main Grid: Calendar + Table */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Smaller Calendar Panel */}
          <div className="rounded-xl bg-white p-4 shadow lg:col-span-1">
            <h2 className="mb-2 text-lg font-semibold">Filter by Date</h2>
            <Calendar
              className="w-full"
              selected={selectedDate}
              onDayClick={(date) => setSelectedDate(date)}
            />
          </div>

          {/* Student Table (Date-Synced) */}
          <div className="lg:col-span-3">
            <InternTable selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
}
