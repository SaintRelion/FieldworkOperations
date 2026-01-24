import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { UpdateUser, User } from "@/models/User";

export default function DepartmentAdviserManagementPage() {
  const {
    useList: getUsers,
    useUpdate: updateUser,
    useDelete: deleteUser,
  } = useResourceLocked<User, never, UpdateUser>("user");

  const departmentAdvisers = getUsers({
    filters: {
      role: "departmentadviser",
    },
  }).data;
  const [search, setSearch] = useState("");

  const filtered = departmentAdvisers.filter((s) => {
    return (
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleConfirmation = (id: string) => {
    const admin = departmentAdvisers.find((a) => a.id === id);
    if (!admin) return;

    updateUser.run({
      id: id,
      payload: { isEnabled: !admin.isEnabled },
    });
  };

  const handleDelete = (id: string) => deleteUser.run(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Department Adviser List</h1>
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
              <th>First Name</th>
              <th>Last Name</th>
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
                  <td className="py-2 pl-1">{da.firstName}</td>
                  <td className="py-2 pl-1">{da.lastName}</td>
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
                  No advisers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
