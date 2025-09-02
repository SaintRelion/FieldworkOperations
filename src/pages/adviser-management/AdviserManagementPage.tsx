import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import { useAuth } from "@saintrelion/auth-lib";
import { useDBOperations, useMockSelect } from "@saintrelion/data-access-layer";
import type { BaseUser } from "@/models/users";

export default function AdviserManagementPage() {
  const { user } = useAuth();

  const { useUpdate, useDelete } = useDBOperations<BaseUser>({
    model: "Users",
    mode: "mock",
  });

  const { data: advisers = [] } = useMockSelect<BaseUser>("Users", {
    filterFn: (r) => r.role === "adviser" && r.department === user?.department,
  });

  const [search, setSearch] = useState("");

  const filtered = advisers.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleEnable = (id: number) => {
    const status = advisers.find((a) => a.id === id)?.isEnabled;

    useUpdate.mutate({
      id: id,
      updates: { isEnabled: !status },
    });
  };

  const handleDelete = (id: number) => useDelete.mutate(id);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Adviser Management</h1>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2"
      />

      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b font-semibold">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className={`border-b ${
                  a.isEnabled ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <td className="py-2 pl-1">{a.name}</td>
                <td>{a.email}</td>
                <td>
                  <span
                    className={`rounded py-1 text-xs font-medium ${
                      a.isEnabled ? "text-green-700" : "text-red-300"
                    }`}
                  >
                    {a.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="space-x-4 text-right">
                  <Button
                    size="sm"
                    className={`h-7 cursor-pointer text-xs ${a.isEnabled ? "bg-transparent" : "bg-black"}`}
                    onClick={() => toggleEnable(a.id)}
                    variant={a.isEnabled ? "secondary" : "default"}
                  >
                    {a.isEnabled ? "Disable" : "Enable"}
                  </Button>
                  <Trash2
                    className="mr-2 inline-block cursor-pointer text-red-700"
                    size={15}
                    onClick={() => handleDelete(a.id)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No advisers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
