import OJTAttendanceTable from "@/components/OJTAttendanceTable";
import type { InternInfo } from "@/models/intern-info";
import type { BaseUser } from "@/models/users";
import { useMockSelect } from "@saintrelion/data-access-layer";

import { Building2 } from "lucide-react";

export default function AdviserDashboard() {
  const { data: internInfos = [] } = useMockSelect<InternInfo>("InternInfos");
  const { data: users = [] } = useMockSelect<BaseUser>("Users");

  const grouped: Record<string, string[]> = {};

  internInfos.forEach((info) => {
    if (!grouped[info.company]) grouped[info.company] = [];

    const user = users.find((u) => u.id === info.userId);
    if (user) grouped[info.company].push(user.name); // push name instead of id
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Adviser Dashboard</h1>

      {/* Main Content */}
      <OJTAttendanceTable />

      {/* Grouping by Company */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Building2 className="h-5 w-5" /> Students Grouped by Company
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([company, students]) => (
            <div key={company} className="rounded-md border p-3 shadow-sm">
              <h3 className="font-medium">{company}</h3>
              <ul className="list-disc pl-4 text-sm">
                {students.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
