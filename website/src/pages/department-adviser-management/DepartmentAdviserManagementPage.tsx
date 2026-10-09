import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Search,
  UserCheck,
  UserX,
  Landmark,
  Filter,
} from "lucide-react";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { UpdateUser, User } from "@/models/User";
import { useCurrentUser } from "@/lib/AuthProvider";
import { RegisterDialog } from "@/components/RegisterUserDialog";
import { toast } from "@saintrelion/notifications";
import { Department } from "@/model_types/department";

export default function DepartmentAdviserManagementPage() {
  const user = useCurrentUser<User>();

  const {
    useList: getUsers,
    useUpdate: updateUser,
    useDelete: deleteUser,
  } = useResourceLocked<User, never, UpdateUser>("user", { showToast: false });

  const departmentAdvisers =
    getUsers({
      filters: { role: "departmentadviser" },
    }).data ?? [];

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");

  const filtered = departmentAdvisers.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.firstName.toLowerCase().includes(term) ||
      s.lastName.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term);

    const matchesDept = filterDept === "ALL" || s.department === filterDept;

    return matchesSearch && matchesDept;
  });

  const toggleConfirmation = async (id: string) => {
    const admin = departmentAdvisers.find((a) => a.id === id);
    if (!admin) return;

    await updateUser.run({
      id: id,
      payload: { isEnabled: !admin.isEnabled },
    });

    toast.success("Status updated");
  };

  const handleEditDepartment = async (targetUser: User) => {
    const options = Object.keys(Department).join(", ");
    const input = window.prompt(
      `Update Department for ${targetUser.firstName}\nAvailable: ${options}`,
      targetUser.department,
    );

    if (!input) return;
    const newKey = input.toUpperCase().trim();

    if (!(newKey in Department)) {
      toast.error(`Invalid Department: ${newKey}`);
      return;
    }

    if (newKey === targetUser.department) return;

    try {
      await updateUser.run({
        id: targetUser.id,
        payload: {
          department: newKey as keyof typeof Department,
        },
      });
      toast.success("Department Updated");
    } catch (err) {
      const error = err as Record<string, string>;
      toast.error("Update failed: " + error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently remove this adviser?")) {
      await deleteUser.run(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-5 border-b border-[#152238]/15 pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">Administration / directory</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">Department advisers</h1>
          <p className="mt-2 text-sm text-slate-600">Manage who can oversee interns and attendance.</p>
        </div>

        {user.roles?.[0] === "admin" && (
          <RegisterDialog
            role="departmentadviser"
            triggerLabel="Register New"
          />
        )}
      </div>

      <div className="flex flex-col gap-3 border border-[#152238]/12 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <Input
            placeholder="Filter by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-slate-200 bg-white pl-10 focus-visible:border-[#1677ff] focus-visible:ring-[#1677ff]/10"
          />
        </div>

        <div className="relative">
          <Filter
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-10 w-full cursor-pointer appearance-none border border-slate-200 bg-white pr-10 pl-9 text-sm font-bold text-slate-600 shadow-sm transition-all outline-none hover:border-slate-300 focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 sm:w-auto"
          >
            <option value="ALL">All Departments</option>
            {Object.keys(Department).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-500">{filtered.length} {filtered.length === 1 ? "adviser" : "advisers"}</span>
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white">
        <table className="min-w-[650px] w-full text-left text-sm">
          <thead className="border-b border-[#09111f] bg-[#09111f] text-[10px] font-bold tracking-[0.16em] text-slate-300 uppercase">
            <tr>
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((da) => (
              <tr
                key={da.id}
                className="group bg-white transition-colors even:bg-[#fbfaf7] hover:bg-[#f4f7fb]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center text-[10px] font-bold ${
                        da.isEnabled
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {da.firstName[0]}
                      {da.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">
                        {da.firstName} {da.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">{da.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-500">
                    @{da.username}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditDepartment(da)}
                    className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 uppercase shadow-sm transition-all hover:border-blue-300 hover:text-blue-600"
                  >
                    <Landmark size={12} className="text-slate-300" />
                    <span>{da.department}</span>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleConfirmation(da.id)}
                      className={`h-8 gap-2 px-3 font-bold transition-all active:translate-y-px ${
                        da.isEnabled
                          ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                          : "border-transparent bg-[#1677ff] text-white shadow-md shadow-blue-100 hover:bg-[#0864db]"
                      }`}
                    >
                      {da.isEnabled ? (
                        <UserX size={14} />
                      ) : (
                        <UserCheck size={14} />
                      )}
                      <span className="text-[11px]">
                        {da.isEnabled ? "Restrict" : "Unlock"}
                      </span>
                    </Button>

                    <button
                      onClick={() => handleDelete(da.id)}
                      className="p-2 text-slate-300 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
              No Results Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
