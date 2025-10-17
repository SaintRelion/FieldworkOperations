import { registerUser } from "@saintrelion/auth-lib";
import { UserRole } from "@/model_types/userrole";
import { Department } from "@/model_types/department";
import { buildFieldsFromModel } from "@/to-be-library/forms/lib/helper";
import type { RenderFormFieldValues } from "@/to-be-library/forms/render-form-fields-model";
import { RenderFormButton } from "@/to-be-library/forms/render-form-button";
import { RenderFormGroups } from "@/to-be-library/forms/render-form-group";
import RenderForm from "@/to-be-library/forms/render-form";
import { RenderCard } from "@/to-be-library/dynamic-ui/render-card";
import { useDBOperations } from "@saintrelion/data-access-layer";
import { pick } from "@/lib/utils";

// ------------------
// 1️⃣ Define field sets
// ------------------
const personalInfoFields = buildFieldsFromModel({
  name: { type: "text", label: "Full Name" },
  email: { type: "email", label: "Email" },
  // employeeID: { type: "text", label: "Employee ID" },
  password: {
    type: "password",
    label: "Password",
    minLength: 6,
  },
  role: { type: "select", options: UserRole, label: "Role" },
  department: { type: "select", options: Department, label: "Department" },
});

const internFields = buildFieldsFromModel({
  program: { type: "text", label: "Program" },
  requiredHours: { type: "number", label: "Required Hours" },
  trainingCompany: { type: "text", label: "Training Company" },
});

const superAdminFields = buildFieldsFromModel({
  systemKey: {
    type: "text",
    label: "System Credentials / Department Code",
  },
});

// ------------------
// 2️⃣ Define groups w/ conditions
// ------------------
const registrationGroups = [
  {
    label: "Personal Information",
    fields: personalInfoFields,
  },
  {
    label: "Intern Details",
    fields: internFields,
    condition: (values: Record<string, RenderFormFieldValues>) =>
      values.role === "intern",
  },
  {
    label: "System Access",
    fields: superAdminFields,
    condition: (values: Record<string, RenderFormFieldValues>) =>
      values.role === "superadmin",
  },
];

const RegistrationPage = () => {
  const { useInsert: internInfoInsert } = useDBOperations("InternInfo");

  const handleRegister = async (data: Record<string, string>) => {
    console.log("Raw submission:", data);

    const userInfo = pick(data, [
      "name",
      "email",
      "password",
      "role",
      "department",
    ]);
    const user = await registerUser(
      userInfo.email,
      userInfo.password,
      userInfo,
    );

    if (userInfo.role == "intern") {
      const internInfo = pick(data, [
        "program",
        "requiredHours",
        "trainingCompany",
      ]);

      internInfoInsert.mutate({
        userId: user?.uid,
        remainingHours: internInfo.requiredHours,
        accomplished: false,
        ...internInfo,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <RenderCard
        wrapperClass="w-full max-w-3xl rounded-2xl shadow-xl"
        headerTitle="Registration"
        headerClass="text-center text-2xl font-bold"
        contentClass="space-y-6"
      >
        <RenderForm>
          <RenderFormGroups groups={registrationGroups} />

          <RenderFormButton
            buttonLabel="Register"
            wrapperClass="mt-6"
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
      </RenderCard>
    </div>
  );
};
export default RegistrationPage;
