import type { InternRow } from "@/features/InternManagementPage/model/types";
import { useCurrentUser } from "@/shared/hooks/useAuth";
import { blockDemoAction } from "@/shared/components/demo/demo-actions";
import { useResourceLocked } from "@/shared/lib/useResource";
import { Department } from "@/shared/model/department";
import type { InternInfo } from "@/shared/model/InternInfo";
import type { UpdateUser, User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { useMemo, useState } from "react";

// ============================================================
// MARK: InternManagement behavior
export function useInternManagementPage() {
  const user = useCurrentUser<User>();

  const {
    useList: getUsers,
    useUpdate: userUpdate,
    useDelete: userDelete,
  } = useResourceLocked<User, never, UpdateUser>("user", { showToast: false });

  const { useList: getInternInfos } = useResourceLocked<InternInfo>(
    "interninfo",
    { showToast: false },
  );

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");

  const internInfos = getInternInfos().data;
  const interns = getUsers(
    user.roles?.[0] === "admin"
      ? { filters: { role: "intern" } }
      : { filters: { role: "intern", department: user.department } },
  ).data;

  const filteredRows: InternRow[] = useMemo(() => {
    return interns
      .filter((intern) => {
        const matchesDept =
          filterDept === "ALL" || intern.department === filterDept;

        const term = search.toLowerCase();
        const matchesSearch =
          intern.firstName.toLowerCase().includes(term) ||
          intern.lastName.toLowerCase().includes(term) ||
          intern.email.toLowerCase().includes(term);

        return matchesDept && matchesSearch;
      })
      .map((intern) => {
        const info = internInfos.find((inf) => inf.userId === intern.id);
        return {
          id: intern.id,
          firstName: intern.firstName,
          lastName: intern.lastName,
          email: intern.email,
          username: intern.username,
          department: intern.department,
          trainingCompany: info?.trainingCompany ?? "—",
          remainingHours: info?.remainingHours ?? "0",
          requiredHours: Number(info?.requiredHours ?? 0),
          isEnabled: intern.isEnabled,
        };
      });
  }, [interns, internInfos, filterDept, search]);

  const toggleConfirmation = async (id: string) => {
    if (blockDemoAction()) return;
    const target = interns.find((i) => i.id === id);
    if (!target) return;
    await userUpdate.run({
      id: id,
      payload: { isEnabled: !target.isEnabled },
    });

    toast.success("Status updated");
  };

  const handleEditDepartment = async (targetUser: User | InternRow) => {
    if (blockDemoAction()) return;
    if (user.roles?.[0] != "departmentadviser") return;

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
      await userUpdate.run({
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
    if (confirm("Permanently delete this intern record?")) {
      await userDelete.run(id);
    }
  };
  return {
    user,
    search,
    setSearch,
    filterDept,
    setFilterDept,
    filteredRows,
    toggleConfirmation,
    handleEditDepartment,
    handleDelete,
  };
}
