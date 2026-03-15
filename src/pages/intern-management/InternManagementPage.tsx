import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { UpdateUser, User } from "@/models/User";
import type { InternInfo } from "@/models/InternInfo";
import { RenderTable } from "@saintrelion/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { RegisterDialog } from "@/components/RegisterUserDialog";

interface InternRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  trainingCompany: string;
  remainingHours: string;
  requiredHours: number;
  isEnabled: boolean;
}

export default function InternManagementPage() {
  const columns: ColumnDef<InternRow>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "First Name", accessorKey: "firstName" },
    { header: "Last Name", accessorKey: "lastName" },
    { header: "Email", accessorKey: "email" },
    { header: "Program", accessorKey: "program" },

    {
      header: "Training Company",
      accessorKey: "trainingCompany",
    },
    { header: "Remaining Hours", accessorKey: "remainingHours" },
    { header: "Required Hours", accessorKey: "requiredHours" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-x-2 text-left">
            <Button
              size="sm"
              className={`h-7 cursor-pointer text-xs transition-colors duration-200 ${
                user.isEnabled
                  ? "border bg-red-200 text-black hover:bg-red-100"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              onClick={() => toggleConfirmation(user.id)}
            >
              {user.isEnabled ? "Restrict" : "Unlock"}
            </Button>
            <Trash2
              className="mr-2 inline-block cursor-pointer text-red-700"
              size={15}
              onClick={() => handleDelete(user.id)}
            />
          </div>
        );
      },
    },
  ];

  const user = useCurrentUser<User>();

  const {
    useList: getUsers,
    useUpdate: userUpdate,
    useDelete: userDelete,
  } = useResourceLocked<User, never, UpdateUser>("user");

  const { useList: getInternInfos } =
    useResourceLocked<InternInfo>("interninfo");

  // TODO: Make documentation on this, Firebase and Mock merging of data, API is a single endpoint
  // Intern Management
  const internInfos = getInternInfos().data;
  const interns = getUsers(
    user.roles && user.roles[0] === "admin"
      ? {
          filters: {
            role: "intern",
          },
        }
      : {
          filters: {
            role: "intern",
            department: user.department,
          },
        },
  ).data;

  const internRow: InternRow[] = interns.map((intern) => {
    const info = internInfos.find((inf) => inf.userId === intern.id);

    return {
      id: intern.id,
      firstName: intern.firstName,
      lastName: intern.lastName,
      email: intern.email,
      program: info?.program ?? "—",
      trainingCompany: info?.trainingCompany ?? "—",
      remainingHours: info?.remainingHours ?? 0,
      requiredHours: info?.requiredHours ?? 0,
      isEnabled: intern.isEnabled,
    } as InternRow;
  });

  const toggleConfirmation = (id: string) => {
    const intern = interns.find((i) => i.id === id);
    if (!intern) return;

    userUpdate.run({
      id: id,
      payload: { isEnabled: !intern.isEnabled },
    });
  };

  const handleDelete = (id: string) => userDelete.run(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Intern List</h1>

        {user.roles && user.roles[0] === "admin" && (
          <RegisterDialog role="intern" triggerLabel="Register New Intern" />
        )}
      </div>

      <RenderTable
        data={internRow}
        columns={columns}
        hiddenColumns={["id"]}
        filters={["firstName", "lastName"]}
      />
    </div>
  );
}
