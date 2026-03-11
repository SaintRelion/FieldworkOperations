import { useAuth } from "@saintrelion/auth-lib";
import { UserRole } from "@/model_types/userrole";
import { Department } from "@/model_types/department";
import {
  RenderForm,
  RenderFormField,
  RenderFormButton,
} from "@saintrelion/forms";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { useState } from "react";
import type { CreateInternInfo } from "@/models/InternInfo";

const RegisterPage = () => {
  const auth = useAuth();

  const [selectedRole, setSelectedRole] = useState("departmentadviser");
  const { useInsert: insertInternInfo } = useResourceLocked<
    never,
    CreateInternInfo
  >("interninfo", { showToast: false });

  const handleRegister = async (data: Record<string, string>) => {
    console.log("Raw submission:", data);

    const userId = await auth.register(
      { ...data, isEnabled: false, roles: [data.role] },
      data.password,
    );

    if (data.role == "intern" && userId) {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-3 rounded-2xl">
        <h1 className="text-center text-2xl font-bold">Registration</h1>
        <RenderForm wrapperClassName="space-y-5">
          <div className="flex flex-col">
            <h2 className="font-bold">Personal Information</h2>
            <div className="grid grid-cols-2 space-x-2">
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
                  label: "Role",
                  type: "select",
                  name: "role",
                  options: UserRole,
                  onValueChange: (value) => {
                    console.log(value);
                    if (typeof value == "string") setSelectedRole(value);
                  },
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

          {selectedRole == "intern" && (
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

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;
