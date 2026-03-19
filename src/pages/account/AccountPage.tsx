import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import type { User } from "@/models/User";
import { useAuth, useCurrentUser } from "@saintrelion/auth-lib";
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
import {
  UserCircle,
  Shield,
  Edit3,
  X,
  Mail,
  Landmark,
  Briefcase,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

// --- PASSWORD UTILITIES (Preserved for Library Compatibility) ---
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

// --- UI COMPONENTS ---
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none";
const labelClass =
  "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block ml-1";

interface DisplayFieldProps {
  label: string;
  value: string;
  // Use LucideIcon type for strict Lucide support
  icon: LucideIcon;
}

function DisplayField({ label, value, icon: Icon }: DisplayFieldProps) {
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={12} className="text-slate-300" />
        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          {label}
        </label>
      </div>
      <div className="text-sm font-bold text-slate-700">{value || "—"}</div>
    </div>
  );
}

export default function AccountPage() {
  const auth = useAuth();
  const user = useCurrentUser<User>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);

  const { useUpdate: updateUser } = useResourceLocked<never, never, User>(
    "user",
    { showToast: false },
  );
  const { useList: getIntern, useUpdate: updateIntern } = useResourceLocked<
    InternInfo,
    never,
    InternInfo
  >("interninfo", { showToast: false });

  const internData = getIntern({ filters: { userId: user.id } }).data;
  const intern = internData?.[0] || null;

  const handleUpdate = async (data: Record<string, string>) => {
    const { trainingCompany, ...userData } = data;

    // Update Core User
    await updateUser.run({ id: user.id, payload: userData });

    // Update Intern Specifics (Removed Program)
    if (user.roles?.[0] === "intern" && intern) {
      await updateIntern.run({
        id: intern.id,
        payload: { trainingCompany },
      });
    }

    toast.success("Profile Updated");
    auth.refreshUser();
    setIsEditing(false);
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
      await updateDoc(ref, { passwordHash: hash, salt });

      toast.success("Password updated successfully");
      setPasswordDialogOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between border-b border-slate-200 px-2 pb-8 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-800">
            Account <span className="text-emerald-600">Terminal</span>
          </h1>
          <p className="mt-1 text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
            Access Level: {user.roles?.[0]?.toUpperCase() || "USER"}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`mt-4 flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all md:mt-0 ${
            isEditing
              ? "bg-slate-100 text-slate-500"
              : "bg-slate-900 text-white shadow-xl shadow-slate-200"
          }`}
        >
          {isEditing ? <X size={14} /> : <Edit3 size={14} />}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="rounded-[2.5rem] border border-white bg-white p-10 shadow-xl shadow-slate-200/50">
        <RenderForm wrapperClassName="space-y-10">
          {/* PERSONAL IDENTITY */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <UserCircle size={20} />
              <h2 className="text-xs font-black tracking-[0.2em] uppercase">
                Profile Credentials
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  <div className="space-y-1">
                    <label className={labelClass}>First Name</label>
                    <RenderFormField
                      field={{ type: "text", name: "firstName" }}
                      defaultValue={user.firstName}
                      inputClassName={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Last Name</label>
                    <RenderFormField
                      field={{ type: "text", name: "lastName" }}
                      defaultValue={user.lastName}
                      inputClassName={inputClass}
                    />
                  </div>
                  {/* If Admin, we let this take the full width to keep it clean */}
                  <div
                    className={`${user.roles?.[0] === "admin" ? "col-span-2" : "col-span-2"} space-y-1`}
                  >
                    <label className={labelClass}>Email Address</label>
                    <RenderFormField
                      field={{ type: "email", name: "email" }}
                      defaultValue={user.email}
                      inputClassName={inputClass}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DisplayField
                    label="First Name"
                    value={user.firstName}
                    icon={UserCircle}
                  />
                  <DisplayField
                    label="Last Name"
                    value={user.lastName}
                    icon={UserCircle}
                  />

                  {/* Display Logic: If admin, span 2 columns to fill the row */}
                  <div
                    className={
                      user.roles?.[0] === "admin"
                        ? "md:col-span-2"
                        : "col-span-1"
                    }
                  >
                    <DisplayField
                      label="Email Address"
                      value={user.email}
                      icon={Mail}
                    />
                  </div>

                  {user.roles?.[0] !== "admin" && (
                    <DisplayField
                      label="Department"
                      value={
                        Department[user.department as keyof typeof Department]
                      }
                      icon={Landmark}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          {/* OJT DEPLOYMENT (Removed Program) */}
          {user.roles?.[0] === "intern" && intern && (
            <div className="space-y-6 border-t border-slate-50 pt-10">
              <div className="flex items-center gap-3 text-emerald-600">
                <Briefcase size={20} />
                <h2 className="text-xs font-black tracking-[0.2em] uppercase">
                  Deployment Info
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isEditing ? (
                  <div className="col-span-2 space-y-1">
                    <label className={labelClass}>Training Company</label>
                    <RenderFormField
                      field={{ type: "text", name: "trainingCompany" }}
                      defaultValue={intern.trainingCompany}
                      inputClassName={inputClass}
                    />
                  </div>
                ) : (
                  <>
                    <DisplayField
                      label="Assigned Company"
                      value={intern.trainingCompany}
                      icon={Briefcase}
                    />
                    <DisplayField
                      label="Requirement"
                      value={`${intern.requiredHours} Total Hours`}
                      icon={Shield}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="pt-6">
              <RenderFormButton
                isDisabled={updateUser.isLocked}
                buttonLabel="Sync Profile Updates"
                buttonClassName="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-emerald-600 active:scale-95"
                onSubmit={handleUpdate}
              />
            </div>
          )}
        </RenderForm>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col items-center gap-6 pt-8">
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogTrigger asChild>
            <button className="group flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-emerald-600">
              <KeyRound
                size={14}
                className="transition-transform group-hover:rotate-12"
              />
              Change Security Credentials
            </button>
          </DialogTrigger>

          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">
                Update <span className="text-emerald-600">Security</span>
              </DialogTitle>
            </DialogHeader>

            <RenderForm wrapperClassName="space-y-6 pt-4">
              <div className="space-y-1">
                <label className={labelClass}>Current Password</label>
                <RenderFormField
                  field={{ type: "password", name: "currentPassword" }}
                  inputClassName={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>New Password</label>
                <RenderFormField
                  field={{ type: "password", name: "newPassword" }}
                  inputClassName={inputClass}
                />
              </div>

              <RenderFormButton
                buttonLabel="Update Password"
                buttonClassName="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-600"
                onSubmit={handleChangePassword}
              />
            </RenderForm>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
