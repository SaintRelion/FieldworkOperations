import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDBOperations, useMockSelect } from "@saintrelion/data-access-layer";
import type { BaseUser } from "@/models/users";

export default function DepartmentAdminManagementPage() {
  const { useUpdate, useDelete } = useDBOperations<BaseUser>({
    model: "Users",
    mode: "mock", // switch to "api" for API-backed
  });

  const { data: departmentAdmins = [] } = useMockSelect<BaseUser>("Users", {
    filterFn: (u) => u.role === "departmentadmin",
  });
  const [search, setSearch] = useState("");

  const filtered = departmentAdmins.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleConfirmation = (id: number) => {
    const admin = departmentAdmins.find((a) => a.id === id);
    if (!admin) return;

    useUpdate.mutate({ id, updates: { isEnabled: !admin.isEnabled } });
  };

  const handleDelete = (id: number) => useDelete.mutate(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Department Admin List</h1>
      </div>

      <Input
        placeholder="Search department admin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2"
      />

      <div className="overflow-auto rounded-xl bg-white p-4 shadow">
        <table className="w-full text-sm">
          <thead className="border-b text-left font-semibold">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((da) => {
              return (
                <tr
                  key={da.id}
                  className={`border-b py-2 ${
                    da.isEnabled ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <td className="py-2 pl-1">{da.name}</td>
                  <td>{da.email}</td>
                  <td>{da.department}</td>
                  <td>
                    <span
                      className={`rounded py-1 text-xs font-medium ${
                        da.isEnabled ? "text-green-700" : "text-red-300"
                      }`}
                    >
                      {da.isEnabled ? "Accepted" : "Declined"}
                    </span>
                  </td>
                  <td className="space-x-2 text-right">
                    <Button
                      size="sm"
                      className={`h-7 cursor-pointer text-xs ${da.isEnabled ? "bg-transparent" : "bg-black"}`}
                      onClick={() => toggleConfirmation(da.id)}
                      variant={da.isEnabled ? "secondary" : "default"}
                    >
                      {da.isEnabled ? "Decline" : "Accept"}
                    </Button>
                    <Trash2
                      className="mr-2 inline-block cursor-pointer text-red-700"
                      size={15}
                      onClick={() => handleDelete(da.id)}
                    />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
