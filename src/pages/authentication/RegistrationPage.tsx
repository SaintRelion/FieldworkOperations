import { registerUser } from "@saintrelion/auth-lib";
import { UserRole } from "@/model_types/userrole";
import { Department } from "@/model_types/department";
import {
  RenderForm,
  RenderFormField,
  RenderFormButton,
} from "@saintrelion/forms";
import { useDBOperations } from "@saintrelion/data-access-layer";
import { useState } from "react";

const RegistrationPage = () => {
  const [selectedRole, setSelectedRole] = useState("intern");

  const { useInsert: internInfoInsert } = useDBOperations("InternInfo");

  const handleRegister = async (data: Record<string, string>) => {
    console.log("Raw submission:", data);

    const { firstname, lastname, email, password, role, department } = data;

    const user = await registerUser(email, password, {
      firstname,
      lastname,
      role,
      department,
    });

    if (role == "intern") {
      const { program, requiredHours, trainingCompany } = data;

      internInfoInsert.mutate({
        userId: user?.uid,
        remainingHours: requiredHours,
        accomplished: false,
        program,
        requiredHours,
        trainingCompany,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-3 rounded-2xl">
        <h1 className="text-center text-2xl font-bold">Registration</h1>
        <RenderForm wrapperClass="space-y-5" onSubmit={handleRegister}>
          <div className="flex flex-col">
            <h2 className="font-bold">Personal Information</h2>
            <div className="grid grid-cols-2 space-x-2">
              <RenderFormField
                field={{ label: "First Name", type: "text", name: "firstname" }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <RenderFormField
                field={{ label: "Last Name", type: "text", name: "lastname" }}
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

          {selectedRole == "superadmin" && (
            <div>
              <h2 className="font-bold">System Access</h2>
              <RenderFormField
                field={{
                  label: "System Credentials / Department Code",
                  type: "text",
                  name: "accesscode",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          )}

          <RenderFormButton buttonLabel="Register" buttonClass="mt-6" />
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
export default RegistrationPage;
