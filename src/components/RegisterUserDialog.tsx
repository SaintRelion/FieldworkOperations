import { useAuth } from "@saintrelion/auth-lib";
import { Department } from "@/model_types/department";
import {
  RenderForm,
  RenderFormField,
  RenderFormButton,
} from "@saintrelion/forms";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CreateInternInfo } from "@/models/InternInfo";
import { Plus, UserCircle, Briefcase, AlertCircle } from "lucide-react";
import { useState } from "react";

interface RegisterDialogProps {
  role: "intern" | "departmentadviser";
  triggerLabel: string;
}

export const RegisterDialog = ({ role, triggerLabel }: RegisterDialogProps) => {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { useInsert: insertInternInfo } = useResourceLocked<
    never,
    CreateInternInfo
  >("interninfo", { showToast: false });

  const handleRegister = async (data: Record<string, string>) => {
    setError(null);

    // 1. Basic Validation (Shared)
    if (
      !data.firstName?.trim() ||
      !data.lastName?.trim() ||
      !data.email?.trim()
    ) {
      setError("Names and Email cannot be empty.");
      return;
    }

    if (!data.password || data.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // 2. OJT Specific Validation
    if (role === "intern") {
      const hours = Number(data.requiredHours);
      if (isNaN(hours) || hours <= 0) {
        setError("Required hours must be greater than 0.");
        return;
      }
      if (!data.trainingCompany?.trim()) {
        setError("Training company is required for interns.");
        return;
      }
    }

    // 3. Execution
    const userId = await auth.register(
      { ...data, isEnabled: true, roles: [role], role: role },
      data.password,
    );

    if (role === "intern" && userId) {
      await insertInternInfo.run({
        userId: userId,
        remainingHours: data.requiredHours.toString(),
        accomplished: false,
        requiredHours: data.requiredHours,
        trainingCompany: data.trainingCompany,
        unexcusedAbsences: "0",
        tardinessCount: "0",
      });
    }
  };

  // Modern Mint UI styling variables
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none";
  const labelClass =
    "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-emerald-600 active:scale-95">
          <Plus className="h-4 w-4 stroke-[3]" />
          {triggerLabel}
        </button>
      </DialogTrigger>

      {/* CHANGE: Increased max-width from sm:max-w-xl to sm:max-w-4xl or 5xl */}
      <DialogContent className="rounded-3xl border-none shadow-2xl sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">
            Register{" "}
            <span className="text-emerald-600">
              {role === "intern" ? "OJT Intern" : "Department Adviser"}
            </span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <RenderForm wrapperClassName="pt-6">
          <div className="flex flex-col items-start gap-10 lg:flex-row">
            {/* LEFT SIDE: Identity & Credentials */}
            <div className="w-full flex-1 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-emerald-600">
                  <UserCircle size={18} />
                  <h2 className="text-xs font-black tracking-widest uppercase">
                    Account Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelClass}>First Name</label>
                    <RenderFormField
                      field={{
                        type: "text",
                        name: "firstName",
                        placeholder: "First name",
                      }}
                      inputClassName={`${inputClass} w-full`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Last Name</label>
                    <RenderFormField
                      field={{
                        type: "text",
                        name: "lastName",
                        placeholder: "Last name",
                      }}
                      inputClassName={`${inputClass} w-full`}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className={labelClass}>Username</label>
                    <RenderFormField
                      field={{
                        type: "text",
                        name: "username",
                        placeholder: "Choose a unique username",
                      }}
                      inputClassName={`${inputClass} w-full`}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className={labelClass}>Email Address</label>
                    <RenderFormField
                      field={{
                        type: "email",
                        name: "email",
                        placeholder: "email@university.edu",
                      }}
                      inputClassName={`${inputClass} w-full`}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className={labelClass}>Password</label>
                    <RenderFormField
                      field={{
                        type: "password",
                        name: "password",
                        placeholder: "••••••••",
                      }}
                      inputClassName={`${inputClass} w-full`}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className={labelClass}>Department Assignment</label>
                    <RenderFormField
                      field={{
                        type: "select",
                        name: "department",
                        options: Department,
                      }}
                      inputClassName={`${inputClass} w-full`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Contextual Info & Action */}
            <div className="w-full space-y-6 lg:w-80 xl:w-[400px]">
              {role === "intern" && (
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Briefcase size={18} />
                    <h2 className="text-xs font-black tracking-widest uppercase">
                      Internship Details
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Required Hours</label>
                      <RenderFormField
                        field={{
                          type: "number",
                          name: "requiredHours",
                          placeholder: "e.g. 480",
                        }}
                        inputClassName={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Training Company</label>
                      <RenderFormField
                        field={{
                          type: "text",
                          name: "trainingCompany",
                          placeholder: "Company Name",
                        }}
                        inputClassName={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <RenderFormButton
                  buttonLabel={
                    auth.isLocked ? "Creating..." : `Confirm Registration`
                  }
                  isDisabled={auth.isLocked}
                  buttonClassName="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-600 shadow-lg active:scale-[0.98]"
                  onSubmit={handleRegister}
                />
                <p className="px-4 text-center text-[10px] leading-relaxed tracking-tight text-slate-400 uppercase">
                  By confirming, you agree to the system's data management
                  policies.
                </p>
              </div>
            </div>
          </div>
        </RenderForm>
      </DialogContent>
    </Dialog>
  );
};
