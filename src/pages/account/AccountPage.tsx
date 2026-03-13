import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { InternInfo } from "@/models/InternInfo";
import { db } from "@saintrelion/auth-lib/dist/lib/firebase-connection";
import {
  RenderForm,
  RenderFormButton,
  RenderFormField,
} from "@saintrelion/forms";
import { toast } from "@saintrelion/notifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Department } from "@/model_types/department";

// Just to get change password work in old library
async function hashPassword(password: string, salt?: string) {
  const enc = new TextEncoder();
  const actualSalt =
    salt ||
    crypto
      .getRandomValues(new Uint8Array(16))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
  const data = enc.encode(password + actualSalt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { hash: hashHex, salt: actualSalt };
}
async function verifyPassword(password: string, hash: string, salt: string) {
  const result = await hashPassword(password, salt);
  return result.hash === hash;
}

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex flex-col">
      <label className="text-sm text-gray-500">{label}</label>
      <div className="rounded-md border border-gray-200 bg-gray-100 px-2 py-1">
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const user = useCurrentUser<User>();

  const [selectedRole] = useState(user?.roles?.[0]);

  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const { useUpdate: updateUser } = useResourceLocked<never, never, User>(
    "user",
    { showToast: true },
  );

  const { useList: getIntern, useUpdate: updateIntern } = useResourceLocked<
    InternInfo,
    never,
    InternInfo
  >("interninfo");

  const interns = getIntern({ filters: { userId: user.id } }).data;
  const intern = interns.length > 0 ? interns[0] : null;

  const handleUpdate = async (data: Record<string, string>) => {
    console.log(data);

    const { program, trainingCompany, ...userData } = data;
    delete userData.requiredHours;

    await updateUser.run({ id: user.id, payload: userData });

    if (selectedRole === "intern") {
      const q = query(
        collection(db, "ojt_InternInfo"),
        where("userId", "==", user.id),
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const internDoc = snap.docs[0];

        await updateIntern.run({
          id: internDoc.id,
          payload: {
            program,
            trainingCompany,
          },
        });
      }
    }
  };

  const handleChangePassword = async (data: Record<string, string>) => {
    const { currentPassword, newPassword } = data;

    const ref = doc(db, "ojt_User", user.id);
    const snap = await getDoc(ref);

    const userData = snap.data();
    if (userData) {
      const valid = await verifyPassword(
        currentPassword,
        userData.passwordHash,
        userData.salt,
      );

      if (!valid) {
        toast.error("Current password incorrect");
        return;
      }

      const { hash, salt } = await hashPassword(newPassword);

      await updateDoc(ref, {
        passwordHash: hash,
        salt,
      });

      toast.success("Password updated");

      setPasswordDialogOpen(false);
    } else {
      toast.error("No record found?");
    }
  };

  if (!user) return null;

  return (
    <div className="w-full space-y-3 rounded-2xl">
      <h1 className="text-center text-2xl font-bold">Account Settings</h1>

      <RenderForm wrapperClassName="space-y-5">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Personal Information</h2>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isEditing ? (
            <>
              <RenderFormField
                field={{ label: "First Name", type: "text", name: "firstName" }}
                defaultValue={user.firstName}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />

              <RenderFormField
                field={{ label: "Last Name", type: "text", name: "lastName" }}
                defaultValue={user.lastName}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />

              <RenderFormField
                field={{ label: "Email", type: "email", name: "email" }}
                defaultValue={user.email}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />

              <DisplayField
                label="Department"
                value={Department[user.department]}
              />
            </>
          ) : (
            <>
              <DisplayField label="First Name" value={user.firstName} />
              <DisplayField label="Last Name" value={user.lastName} />
              <DisplayField label="Email" value={user.email} />
              <DisplayField
                label="Department"
                value={Department[user.department]}
              />
            </>
          )}
        </div>

        {selectedRole === "intern" && intern && (
          <div className="space-y-2">
            <h2 className="font-bold">Intern Details</h2>

            {isEditing ? (
              <>
                <RenderFormField
                  field={{ label: "Program", type: "text", name: "program" }}
                  defaultValue={intern.program}
                  inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />

                <DisplayField
                  label="Required Hours"
                  value={intern.requiredHours}
                />

                <RenderFormField
                  field={{
                    label: "Training Company",
                    type: "text",
                    name: "trainingCompany",
                  }}
                  defaultValue={intern.trainingCompany}
                  inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
              </>
            ) : (
              <>
                <DisplayField label="Program" value={intern?.program} />
                <DisplayField
                  label="Required Hours"
                  value={intern.requiredHours}
                />
                <DisplayField
                  label="Training Company"
                  value={intern.trainingCompany}
                />
              </>
            )}
          </div>
        )}

        {isEditing && (
          <RenderFormButton
            isDisabled={updateUser.isLocked}
            buttonLabel="Update Profile"
            onSubmit={handleUpdate}
          />
        )}
      </RenderForm>

      {/* PASSWORD DIALOG */}

      <div className="flex justify-center">
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-sm text-blue-600 hover:underline">
              Change Password
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>

            <RenderForm wrapperClassName="space-y-4">
              <RenderFormField
                field={{
                  label: "Current Password",
                  type: "password",
                  name: "currentPassword",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2"
              />

              <RenderFormField
                field={{
                  label: "New Password",
                  type: "password",
                  name: "newPassword",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2"
              />

              <RenderFormButton
                buttonLabel="Update Password"
                onSubmit={handleChangePassword}
              />
            </RenderForm>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
