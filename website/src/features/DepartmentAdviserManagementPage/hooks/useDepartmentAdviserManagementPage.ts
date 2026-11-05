import { useCurrentUser } from "@/shared/hooks/useAuth";
import { blockDemoAction } from "@/shared/components/demo/demo-actions";
import { useResourceLocked } from "@/shared/lib/useResource";
import { Department } from "@/shared/model/department";
import type { UpdateUser, User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { useState } from "react";

// ============================================================
// MARK: DepartmentAdviserManagement behavior
export function useDepartmentAdviserManagementPage() {
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
    if (blockDemoAction()) return;
    const admin = departmentAdvisers.find((a) => a.id === id);
    if (!admin) return;

    await updateUser.run({
      id: id,
      payload: { isEnabled: !admin.isEnabled },
    });

    toast.success("Status updated");
  };

  const handleEditDepartment = async (targetUser: User) => {
    if (blockDemoAction()) return;
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
    if (blockDemoAction()) return;
    if (confirm("Permanently remove this adviser?")) {
      await deleteUser.run(id);
    }
  };
  return {
    user,
    search,
    setSearch,
    filterDept,
    setFilterDept,
    filtered,
    toggleConfirmation,
    handleEditDepartment,
    handleDelete,
  };
}
