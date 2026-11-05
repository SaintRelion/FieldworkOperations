import { DisplayField } from "@/features/AccountPage/components/DisplayField";
import { useAccountPage } from "@/features/AccountPage/hooks/useAccountPage";
import { inputClass, labelClass } from "@/features/AccountPage/lib/form-styles";
import { DemoNotice } from "@/shared/components/demo/DemoNotice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { isDemo } from "@/shared/config/demo";
import { Department } from "@/shared/model/department";
import {
  RenderForm,
  RenderFormButton,
  RenderFormField,
} from "@saintrelion/forms";
import {
  Briefcase,
  Edit3,
  KeyRound,
  Landmark,
  Mail,
  Shield,
  UserCircle,
} from "lucide-react";

export default function AccountPage() {
  const {
    user,
    isEditing,
    setIsEditing,
    passwordDialogOpen,
    setPasswordDialogOpen,
    isChangingPassword,
    intern,
    handleUpdate,
    handleChangePassword,
  } = useAccountPage();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {isDemo && <DemoNotice />}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Your account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Profile & security
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage the details used across your fieldwork records.
          </p>
        </div>

        <button
          disabled={isDemo}
          onClick={() => setIsEditing(!isEditing)}
          className={`inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2.5 text-sm font-semibold transition-colors ${
            isEditing
              ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {!isEditing && <Edit3 size={14} />}
          {isDemo ? "Profile editing unavailable in demo" : isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="border border-slate-200 bg-white p-5 sm:p-8">
        <RenderForm wrapperClassName="space-y-8">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Personal details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your name, email and department.
              </p>
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
                    <DisplayField
                      label="Email Address"
                      value={user.email}
                      icon={Mail}
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
                <h2 className="text-lg font-semibold text-slate-900">
                  Placement
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your assigned training site and required hours.
                </p>
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
            <p className="mt-1 text-sm text-slate-500">
              {isDemo
                ? "Password changes are unavailable in the demo. Demo accounts use anonymous sign-in."
                : "Update the password for this account."}
            </p>
          </div>
          <Dialog
            open={!isDemo && passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          >
            <DialogTrigger asChild>
              <button disabled={isDemo} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                <KeyRound size={16} />
                Change password
              </button>
            </DialogTrigger>

            <DialogContent className="border border-slate-200 bg-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Change password
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
                  buttonLabel={
                    isChangingPassword ? "Updating..." : "Update Password"
                  }
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
