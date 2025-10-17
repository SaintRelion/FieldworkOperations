import { RenderDataCore } from "@/to-be-library/dynamic-ui/render-data-core";
import OJTAttendanceTable from "@/components/OJTAttendanceTable";
import type { InternInfo } from "@/models/intern-info";
import type { User } from "@/models/user";
import { useAuth } from "@saintrelion/auth-lib";
import { useDBOperations } from "@saintrelion/data-access-layer";
import { UserPlus } from "lucide-react";

export function DepartmentAdviserDashboard() {
  const { user } = useAuth();

  const { useSelect: userSelect } = useDBOperations<User>("User");
  const { useSelect: interinfoSelect } =
    useDBOperations<InternInfo>("InternInfo");

  const userDepartment = user.department;

  // 👩‍🎓 Interns filtered by department
  const { data: interns = [] } = userSelect({
    mockOptions: {
      filterFn: (u) => u.role === "intern" && u.department === userDepartment,
    },
  });
  const { data: internInfos = [] } = interinfoSelect();

  const grouped: Record<string, string[]> = {};
  internInfos.forEach((info) => {
    if (!grouped[info.trainingCompany]) grouped[info.trainingCompany] = [];

    const user = interns.find((u) => u.id === info.userId);
    if (user) grouped[info.trainingCompany].push(user.name); // push name instead of id
  });

  const stats = [
    {
      icon: <UserPlus className="h-10 w-10 text-green-500" />,
      title: "Total Students",
      value: interns.length,
    },
  ];

  if (!userDepartment)
    return <div>Department not Found, this shouldn't happen</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {
        <RenderDataCore
          data={stats}
          // Header
          headerCustomUI={{
            title: `Department Adviser Dashboard (${userDepartment})`,
            titleClass: "text-2xl font-bold",
          }}
          // Content
          contentCustomUI={{
            layoutClass: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
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
      }

      {/* Main Content */}
      <OJTAttendanceTable />

      {/* Grouping by Company
      <RenderDataCore
        data={internInfos}
        wrapperClass="rounded-2xl bg-white shadow border-1 p-4 space-y-3"
        // Header
        headerCustomUI={{
          renderHeader: () => (
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" /> Students Grouped by Company
            </h2>
          ),
        }}
        // Filter
        enableFilters={true}
        filters={[
          { label: "Companies", key: "trainingCompany" },
          // { label: "Programs", key: "program" },
        ]}
        searchBy={["program", "trainingCompany"]}
        // Content
        contentCustomUI={{
          layoutClass: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        }}
        renderItem={(item) => (
          <ul className="list-disc pl-4 text-sm">
            <li>{item.trainingCompany}</li>
          </ul>
        )}
        // Pagination
        enablePagination={true}
        pageSize={pageSize}
        paginationCustomUI={{ wrapperClass: "mt-5" }}
      /> */}
    </div>
  );
}
