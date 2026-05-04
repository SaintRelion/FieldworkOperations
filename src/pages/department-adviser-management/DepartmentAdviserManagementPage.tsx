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
import { useCurrentUser } from "@saintrelion/auth-lib";
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

    // NEW: Check if it matches the selected department (or if ALL is selected)
    const matchesDept = filterDept === "ALL" || s.department === filterDept;

    return matchesSearch && matchesDept;
  });

  const toggleConfirmation = async (id: string) => {
    const admin = departmentAdvisers.find((a) => a.id === id);
    if (!admin) return;

    // Direct manual execution
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

    // Validation: Must be a valid key from your Department object
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
    <div className="space-y-6">
      {/* HEADER: MINT ACCENTS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Adviser <span className="text-emerald-600">Management</span>
          </h1>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            OJT & Faculty Administration
          </p>
        </div>

        {user.roles?.[0] === "admin" && (
          <RegisterDialog
            role="departmentadviser"
            triggerLabel="Register New"
          />
        )}
      </div>

      {/* SEARCH & FILTER: STRAIGHTFORWARD */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <Input
            placeholder="Filter by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-slate-200 bg-white pl-10 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10"
          />
        </div>

        {/* NEW: Native Select Dropdown for Filtering */}
        <div className="relative">
          <Filter
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pr-10 pl-9 text-sm font-bold text-slate-600 shadow-sm transition-all outline-none hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 sm:w-auto"
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
      </div>

      {/* TABLE: CLEAN SLATE DESIGN */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            <tr>
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((da) => (
              <tr
                key={da.id}
                className="group transition-colors hover:bg-emerald-50/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black ${
                        da.isEnabled
                          ? "bg-emerald-100 text-emerald-700"
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
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-500">
                    @{da.username}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditDepartment(da)}
                    className="flex items-center gap-2 rounded-md border border-slate-100 bg-white px-2 py-1 text-[10px] font-black text-slate-500 uppercase shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600"
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
                      className={`h-8 gap-2 rounded-lg px-3 font-bold transition-all active:scale-95 ${
                        da.isEnabled
                          ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                          : "border-transparent bg-slate-900 text-white shadow-md shadow-slate-200 hover:bg-emerald-600"
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
