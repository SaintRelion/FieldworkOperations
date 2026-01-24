import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { UpdateUser, User } from "@/models/User";
import type { InternInfo } from "@/models/InternInfo";
import { RenderTable } from "@saintrelion/ui";
import type { ColumnDef } from "@tanstack/react-table";

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
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span
            className={`rounded py-1 text-xs font-medium ${
              user.isEnabled ? "text-green-700" : "text-red-300"
            }`}
          >
            {user.isEnabled ? "Accepted" : "Declined"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-x-2 text-left">
            <Button
              size="sm"
              className={`h-7 cursor-pointer text-xs ${user.isEnabled ? "bg-transparent" : "bg-black"}`}
              onClick={() => toggleConfirmation(user.id)}
              variant={user.isEnabled ? "secondary" : "default"}
            >
              {user.isEnabled ? "Decline" : "Accept"}
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

  const { useList: selectInternInfos } =
    useResourceLocked<InternInfo>("interninfo");

  // TODO: Make documentation on this, Firebase and Mock merging of data, API is a single endpoint
  // Intern Management
  const internInfos = selectInternInfos().data;
  const interns = getUsers({
    filters: {
      role: "intern",
      department: user.department,
    },
  }).data;

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
