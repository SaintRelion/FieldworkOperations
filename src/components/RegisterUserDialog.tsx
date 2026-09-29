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
import { Plus, UserCircle, Briefcase, AlertCircle, ArrowRight } from "lucide-react";
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

  const inputClass =
    "w-full border border-[#152238]/15 bg-white px-3 py-2.5 text-sm transition-all focus:border-[#1677ff] focus:ring-4 focus:ring-[#1677ff]/10 focus:outline-none";
  const labelClass =
    "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 border border-[#1677ff] bg-[#1677ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(22,119,255,0.16)] transition-all hover:bg-[#0864db] active:translate-y-px">
          <Plus className="h-4 w-4 stroke-[3]" />
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#152238]/15 bg-[#f8f6f0] p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="border-b border-[#152238]/10 bg-[#09111f] px-7 py-6 text-white">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#81baff] uppercase">New directory record</p>
          <DialogTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">
            Register {role === "intern" ? "OJT Intern" : "Department Adviser"}
          </DialogTitle>
          <p className="text-sm font-normal text-slate-400">Create credentials and assign the required operational details.</p>
        </DialogHeader>

        {error && (
          <div className="mx-7 mt-5 flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <RenderForm wrapperClassName="p-7">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="w-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#152238]/10 pb-3 text-[#1677ff]">
                  <UserCircle size={18} />
                  <h2 className="text-xs font-bold tracking-[0.18em] uppercase">
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

            <div className="w-full space-y-6">
              {role === "intern" && (
                <div className="space-y-5 border border-[#152238]/10 bg-white p-6 shadow-[0_10px_26px_rgba(9,17,31,0.05)]">
                  <div className="flex items-center gap-2 border-b border-[#152238]/10 pb-3 text-[#b06b00]">
                    <Briefcase size={18} />
                    <h2 className="text-xs font-bold tracking-[0.18em] uppercase">
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
                  buttonClassName="w-full bg-[#1677ff] py-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(22,119,255,0.18)] transition-all hover:bg-[#0864db] active:translate-y-px"
                  onSubmit={handleRegister}
                />
                <div className="pointer-events-none -mt-[49px] flex h-12 items-center justify-end pr-4 text-white"><ArrowRight size={17} /></div>
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
