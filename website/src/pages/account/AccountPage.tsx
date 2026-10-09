import { useRef, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { User } from "@/models/User";
import { useAuth, useCurrentUser } from "@/lib/AuthProvider";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import type { InternInfo } from "@/models/InternInfo";
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
  Mail,
  Landmark,
  Briefcase,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

const inputClass =
  "w-full border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#1677ff] focus:outline-none";
const labelClass =
  "mb-1 block text-xs font-semibold text-slate-600";

interface DisplayFieldProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

function DisplayField({ label, value, icon: Icon }: DisplayFieldProps) {
  return (
    <div className="border-b border-slate-200 py-4">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <label className="text-xs font-medium text-slate-500">
          {label}
        </label>
      </div>
      <div className="text-sm font-semibold text-slate-800">{value || "—"}</div>
    </div>
  );
}

export default function AccountPage() {
  const auth = useAuth();
  const user = useCurrentUser<User>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const passwordChangeInFlight = useRef(false);

  const { useList: getIntern } = useResourceLocked<
    InternInfo,
    never,
    InternInfo
  >("interninfo", { showToast: false });

  const internData = getIntern({ filters: { userId: user.id } }).data;
  const intern = internData?.[0] || null;

  const handleUpdate = async (data: Record<string, string>) => {
    const { trainingCompany, firstName, lastName } = data;

    // Update Core User
    await updateDoc(doc(db, "ojt_User", user.id), { firstName, lastName, updatedAt: serverTimestamp() });

    // Update Intern Specifics (Removed Program)
    if (user.roles?.[0] === "intern" && intern) {
      await updateDoc(doc(db, "ojt_InternInfo", intern.id), { trainingCompany, updatedAt: serverTimestamp() });
    }

    toast.success("Profile Updated");
    auth.refreshUser();
    setIsEditing(false);
  };

  const handleChangePassword = async (data: Record<string, string>) => {
    if (passwordChangeInFlight.current) return;
    passwordChangeInFlight.current = true;
    setIsChangingPassword(true);
    const { currentPassword, newPassword } = data;
    try {
      await auth.changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setPasswordDialogOpen(false);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      toast.error(code === "auth/invalid-credential" || code === "auth/wrong-password"
        ? "Current password is incorrect. Your password was not changed."
        : error instanceof Error ? error.message : "Password update failed.");
    } finally {
      passwordChangeInFlight.current = false;
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Your account</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Profile & security</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage the details used across your fieldwork records.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            isEditing
              ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {!isEditing && <Edit3 size={14} />}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="border border-slate-200 bg-white p-5 sm:p-8">
        <RenderForm wrapperClassName="space-y-8">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
              <p className="mt-1 text-sm text-slate-500">Your name, email and department.</p>
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
                  <div className="space-y-1 md:col-span-2">
                    <DisplayField label="Email Address" value={user.email} icon={Mail} />
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
          {user.roles?.[0] === "intern" && intern && (
            <div className="space-y-5 border-t border-slate-200 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Placement</h2>
                <p className="mt-1 text-sm text-slate-500">Your assigned training site and required hours.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isEditing ? (
                  <div className="space-y-1 md:col-span-2">
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
            <div className="flex justify-end border-t border-slate-200 pt-6">
              <RenderFormButton
                buttonLabel="Save profile"
                buttonClassName="bg-[#1677ff] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0864db]"
                onSubmit={handleUpdate}
              />
            </div>
          )}
        </RenderForm>
      </div>

      <div className="border border-slate-200 bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Password</h2>
            <p className="mt-1 text-sm text-slate-500">Update the password for this account.</p>
          </div>
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <KeyRound size={16} />
              Change password
            </button>
          </DialogTrigger>

          <DialogContent className="border border-slate-200 bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">Change password</DialogTitle>
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
                buttonLabel={isChangingPassword ? "Updating..." : "Update Password"}
                isDisabled={isChangingPassword}
                buttonClassName="w-full bg-[#1677ff] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0864db]"
                onSubmit={handleChangePassword}
              />
            </RenderForm>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
