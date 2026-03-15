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
import { Plus } from "lucide-react";

interface RegisterDialogProps {
  role: "intern" | "departmentadviser";
  triggerLabel: string;
}

export const RegisterDialog = ({ role, triggerLabel }: RegisterDialogProps) => {
  const auth = useAuth();

  const { useInsert: insertInternInfo } = useResourceLocked<
    never,
    CreateInternInfo
  >("interninfo", { showToast: false });

  const handleRegister = async (data: Record<string, string>) => {
    console.log("Raw submission:", data);

    const userId = await auth.register(
      { ...data, isEnabled: true, roles: [role], role: role },
      data.password,
    );

    if (role === "intern" && userId) {
      const { program, requiredHours, trainingCompany } = data;
      insertInternInfo.run({
        userId: userId,
        remainingHours: requiredHours,
        accomplished: false,
        program,
        requiredHours,
        trainingCompany,
        unexcusedAbsences: "0",
        tardinessCount: "0",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-gray-800 bg-black px-4 py-2 text-white transition-colors duration-200 hover:bg-white hover:text-black">
          <Plus className="h-5 w-5 stroke-2" />
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Register {role === "intern" ? "Intern" : "Adviser"}
          </DialogTitle>
        </DialogHeader>

        <RenderForm wrapperClassName="space-y-5">
          {/* Personal Info */}
          <div className="flex flex-col">
            <h2 className="font-bold">Personal Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <RenderFormField
                field={{ label: "First Name", type: "text", name: "firstName" }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{ label: "Last Name", type: "text", name: "lastName" }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{ label: "Email", type: "email", name: "email" }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{
                  label: "Password",
                  type: "password",
                  name: "password",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{
                  label: "Department",
                  type: "select",
                  name: "department",
                  options: Department,
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Intern Details */}
          {role === "intern" && (
            <div>
              <h2 className="font-bold">Intern Details</h2>
              <RenderFormField
                field={{ label: "Program", type: "text", name: "program" }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{
                  label: "Required Hours",
                  type: "number",
                  name: "requiredHours",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{
                  label: "Training Company",
                  type: "text",
                  name: "trainingCompany",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          )}

          <RenderFormButton
            buttonLabel="Register"
            isDisabled={auth.isLocked}
            buttonClassName="mt-6"
            onSubmit={handleRegister}
          />
        </RenderForm>
      </DialogContent>
    </Dialog>
  );
};
