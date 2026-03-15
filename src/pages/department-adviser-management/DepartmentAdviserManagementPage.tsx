import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { UpdateUser, User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { RegisterDialog } from "@/components/RegisterUserDialog";

export default function DepartmentAdviserManagementPage() {
  const user = useCurrentUser<User>();

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

        {/* Only show RegisterDialog if user is admin */}
        {user.roles && user.roles[0] === "admin" && (
          <RegisterDialog
            role="departmentadviser"
            triggerLabel="Register New Adviser"
          />
        )}
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
              <th>Actions</th>
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
                  <td className="space-x-2">
                    <Button
                      size="sm"
                      className={`h-7 cursor-pointer text-xs transition-colors duration-200 ${
                        da.isEnabled
                          ? "border border-gray-800 bg-white text-black hover:bg-gray-100"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                      onClick={() => toggleConfirmation(da.id)}
                    >
                      {da.isEnabled ? "Restrict" : "Unlock"}
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
