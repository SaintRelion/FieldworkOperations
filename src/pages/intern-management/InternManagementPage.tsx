import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  UserCheck,
  UserX,
  Briefcase,
  Clock,
  Landmark,
} from "lucide-react";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { UpdateUser, User } from "@/models/User";
import type { InternInfo } from "@/models/InternInfo";
import { RenderTable } from "@saintrelion/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { RegisterDialog } from "@/components/RegisterUserDialog";
import { toast } from "@saintrelion/notifications";
import { Department } from "@/model_types/department";

interface InternRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  trainingCompany: string;
  remainingHours: string;
  requiredHours: number;
  isEnabled: boolean;
}

export default function InternManagementPage() {
  const user = useCurrentUser<User>();

  // HOOKS: Disable generic toasts
  const {
    useList: getUsers,
    useUpdate: userUpdate,
    useDelete: userDelete,
  } = useResourceLocked<User, never, UpdateUser>("user", { showToast: false });

  const { useList: getInternInfos } = useResourceLocked<InternInfo>(
    "interninfo",
    { showToast: false },
  );

  // DATA FETCHING
  const internInfos = getInternInfos().data;
  const interns = getUsers(
    user.roles?.[0] === "admin"
      ? { filters: { role: "intern" } }
      : { filters: { role: "intern", department: user.department } },
  ).data;

  // MAPPING DATA TO ROW
  const internRows: InternRow[] = useMemo(() => {
    return interns.map((intern) => {
      const info = internInfos.find((inf) => inf.userId === intern.id);
      return {
        id: intern.id,
        firstName: intern.firstName,
        lastName: intern.lastName,
        email: intern.email,
        department: intern.department,
        trainingCompany: info?.trainingCompany ?? "—",
        remainingHours: info?.remainingHours ?? "0",
        requiredHours: Number(info?.requiredHours ?? 0),
        isEnabled: intern.isEnabled,
      };
    });
  }, [interns, internInfos]);

  // ACTIONS
  const toggleConfirmation = async (id: string) => {
    const target = interns.find((i) => i.id === id);
    if (!target) return;
    await userUpdate.run({
      id: id,
      payload: { isEnabled: !target.isEnabled },
    });

    toast.success("Status updated");
  };

  const handleEditDepartment = async (targetUser: User | InternRow) => {
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
    if (confirm("Permanently delete this intern record?")) {
      await userDelete.run(id);
    }
  };

  // COLUMN DEFINITIONS
  const columns: ColumnDef<InternRow>[] = [
    {
      header: "Intern Identity",
      accessorKey: "firstName",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black ${
                d.isEnabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {d.firstName[0]}
              {d.lastName[0]}
            </div>
            <div>
              <p className="font-bold text-slate-700">
                {d.firstName} {d.lastName}
              </p>
              <p className="text-[11px] leading-tight text-slate-400">
                {d.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Department",
      accessorKey: "department",
      cell: ({ row }) => (
        <button
          onClick={() => handleEditDepartment(row.original)}
          className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50/50 px-2 py-1 text-[10px] font-black text-slate-400 uppercase transition-colors hover:bg-white hover:text-emerald-600"
        >
          <Landmark size={12} />
          {row.original.department}
        </button>
      ),
    },
    {
      header: "Training Site",
      accessorKey: "trainingCompany",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 font-medium text-slate-600">
          <Briefcase size={14} className="text-slate-300" />
          <span>{getValue() as string}</span>
        </div>
      ),
    },
    {
      header: "Progress",
      accessorKey: "remainingHours",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-emerald-500" />
          <span className="font-bold text-slate-700">
            {row.original.remainingHours}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-medium text-slate-400">
            {row.original.requiredHours}h
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleConfirmation(d.id)}
              className={`h-8 gap-2 rounded-lg px-3 font-bold transition-all active:scale-95 ${
                d.isEnabled
                  ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                  : "border-transparent bg-slate-900 text-white shadow-md shadow-slate-200 hover:bg-emerald-600"
              }`}
            >
              {d.isEnabled ? <UserX size={14} /> : <UserCheck size={14} />}
              <span className="text-[11px]">
                {d.isEnabled ? "Restrict" : "Unlock"}
              </span>
            </Button>

            <button
              onClick={() => handleDelete(d.id)}
              className="p-2 text-slate-300 transition-colors hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER: MINT & SLATE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Intern <span className="text-emerald-600">Management</span>
          </h1>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            OJT Student Monitoring & Logs
          </p>
        </div>

        {user.roles?.[0] === "admin" && (
          <RegisterDialog role="intern" triggerLabel="Register New Intern" />
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-emerald-900/5">
        <RenderTable
          data={internRows}
          columns={columns}
          hiddenColumns={["id"]}
          filters={["firstName", "lastName", "email", "trainingCompany"]}
        />
      </div>
    </div>
  );
}
