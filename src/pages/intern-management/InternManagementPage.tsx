import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import { useAuth } from "@saintrelion/auth-lib";
import { useDBOperations, useMockSelect } from "@saintrelion/data-access-layer";
import type { BaseUser } from "@/models/users";
import type { InternInfo } from "@/models/intern-info";

export default function InternManagementPage() {
  const { user } = useAuth();
  const { useUpdate, useDelete } = useDBOperations<BaseUser>({
    model: "Users",
    mode: "mock", // switch to "api" for real API
  });

  const { data: internInfos = [] } = useMockSelect<InternInfo>("InternInfos");
  const { data: interns = [] } = useMockSelect<BaseUser>("Users", {
    filterFn: (u) => u.role === "intern" && u.department === user?.department,
  });
  const [search, setSearch] = useState("");

  const filtered = interns.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleConfirmation = (id: number) => {
    const intern = interns.find((i) => i.id === id);
    if (!intern) return;

    useUpdate.mutate({ id, updates: { isEnabled: !intern.isEnabled } });
  };

  const handleDelete = (id: number) => useDelete.mutate(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Intern List</h1>
      </div>

      <Input
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2"
      />

      <div className="overflow-auto rounded-xl bg-white p-4 shadow">
        <table className="w-full text-sm">
          <thead className="border-b text-left font-semibold">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>School Year</th>
              <th>Company</th>
              <th>Required</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const info = internInfos.find((i) => i.userId == s.id);
              return info == null ? (
                <div>Incomplete Data</div>
              ) : (
                <tr
                  key={s.id}
                  className={`border-b py-2 ${
                    s.isEnabled ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <td className="py-2 pl-1">{s.name}</td>
                  <td>{s.email}</td>
                  <td>{info.program}</td>
                  <td>{info.schoolYear}</td>
                  <td>{info.company}</td>
                  <td>{info.requiredHours} hrs</td>
                  <td>
                    <span
                      className={`rounded py-1 text-xs font-medium ${
                        s.isEnabled ? "text-green-700" : "text-red-300"
                      }`}
                    >
                      {s.isEnabled ? "Accepted" : "Declined"}
                    </span>
                  </td>
                  <td className="space-x-2 text-right">
                    <Button
                      size="sm"
                      className={`h-7 cursor-pointer text-xs ${s.isEnabled ? "bg-transparent" : "bg-black"}`}
                      onClick={() => toggleConfirmation(s.id)}
                      variant={s.isEnabled ? "secondary" : "default"}
                    >
                      {s.isEnabled ? "Decline" : "Accept"}
                    </Button>
                    <Trash2
                      className="mr-2 inline-block cursor-pointer text-red-700"
                      size={15}
                      onClick={() => handleDelete(s.id)}
                    />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
