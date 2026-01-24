import { RenderDataCore } from "@saintrelion/ui";
import OJTAttendanceTable from "@/components/OJTAttendanceTable";
import type { InternInfo } from "@/models/InternInfo";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { UserPlus } from "lucide-react";

export function DepartmentAdviserDashboard() {
  const user = useCurrentUser<User>();

  // Intern Select
  const { useList: getUsers } = useResourceLocked<User>("user");
  const { useList: getInternInfos } =
    useResourceLocked<InternInfo>("interninfo");

  // Intern Selection by Department
  const interns = getUsers({
    filters: {
      role: "intern",
      department: user.department,
    },
  }).data;
  const internInfos = getInternInfos().data;

  const grouped: Record<string, string[]> = {};
  internInfos.forEach((info) => {
    if (!grouped[info.trainingCompany]) grouped[info.trainingCompany] = [];

    const user = interns.find((u) => u.id === info.userId);
    if (user)
      grouped[info.trainingCompany].push(`${user.firstName} ${user.lastName}`); // push name instead of id
  });

  const stats = [
    {
      icon: <UserPlus className="h-10 w-10 text-green-500" />,
      title: "Total Students",
      value: interns.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div>
        <h1 className="text-2xl font-bold">
          Department Adviser Dashboard ({user.department})
        </h1>
      </div>
      <RenderDataCore
        data={stats}
        ui={{
          content: {
            wrapperClassName: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          },
        }}
        renderItem={(item) => (
          <div className="flex items-center space-x-4 rounded-2xl bg-white p-4 shadow">
            {item.icon}
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>{" "}
              <p className="text-lg font-semibold">{item.value}</p>
            </div>
          </div>
        )}
      />

      {/* Main Content */}
      <OJTAttendanceTable />
    </div>
  );
}
