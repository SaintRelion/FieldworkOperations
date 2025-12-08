import { useRegisterUser } from "@saintrelion/auth-lib";
import { UserRole } from "@/model_types/userrole";
import { Department } from "@/model_types/department";
import {
  RenderForm,
  RenderFormField,
  RenderFormButton,
} from "@saintrelion/forms";
import { useDBOperationsLocked } from "@saintrelion/data-access-layer";
import { useState } from "react";

const RegistrationPage = () => {
  const [selectedRole, setSelectedRole] = useState("intern");

  const { useInsert: internInfoInsert } = useDBOperationsLocked("InternInfo");
  const registerUser = useRegisterUser();

  const handleRegister = async (data: Record<string, string>) => {
    console.log("Raw submission:", data);

    const { firstName, lastName, email, password, role, department } = data;

    const user = await registerUser.run({
      info:
        role == "superadmin"
          ? {
              email,
              firstName,
              lastName,
              role,
            }
          : {
              email,
              firstName,
              lastName,
              role,
              department,
            },
      password: password,
    });

    if (role == "intern") {
      const { program, requiredHours, trainingCompany } = data;

      internInfoInsert.run({
        userId: user?.id,
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
        <RenderForm wrapperClass="space-y-5">
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
              {selectedRole != "superadmin" && (
                <RenderFormField
                  field={{
                    label: "Department",
                    type: "select",
                    name: "department",
                    options: Department,
                  }}
                  inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
              )}
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

          {/* {selectedRole == "superadmin" && (
            <div>
              <h2 className="font-bold">System Access</h2>
              <RenderFormField
                field={{
                  label: "System Credentials / Department Code",
                  type: "text",
                  name: "accessCode",
                }}
                inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          )} */}

          <RenderFormButton
            buttonLabel="Register"
            isDisabled={registerUser.isLocked}
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
export default RegistrationPage;
