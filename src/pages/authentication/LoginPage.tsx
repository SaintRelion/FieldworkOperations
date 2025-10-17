import { firebaseLoginWithEmail, useAuth } from "@saintrelion/auth-lib";
import { Link, useNavigate } from "react-router-dom";
import { buildFieldsFromModel } from "@/to-be-library/forms/lib/helper";
import RenderForm from "@/to-be-library/forms/render-form";
import { RenderFormFields } from "@/to-be-library/forms/render-form-fields";
import { RenderFormButton } from "@/to-be-library/forms/render-form-button";
import { RenderCard } from "@/to-be-library/dynamic-ui/render-card";

const LoginPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const authenticateFields = buildFieldsFromModel({
    email: { type: "email", label: "Email" },
    password: { type: "password", label: "Password" },
  });

  const handleLogin = async (data: Record<string, string>) => {
    // Normally you'd call API here, then save returned user
    console.log("Raw submission:", data);

    await firebaseLoginWithEmail(
      data.email,
      data.password,
      setUser,
      (loggedInUser) => {
        if (loggedInUser.role == "superadmin")
          navigate("/departmentadvisers"); // redirect to dashboard
        else navigate("/");

        console.log(loggedInUser.createdAt.toDate());
      },
    );

    // await firebaseLoginWithGoogle(setUser, (loggedInUser) => {
    //   if (loggedInUser.role == "superadmin")
    //     navigate("/departmentadvisers"); // redirect to dashboard
    //   else navigate("/");
    //   console.log(loggedInUser);
    // });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <RenderCard
        headerTitle="Login"
        headerClass="text-center text-2xl font-bold"
        wrapperClass="w-full max-w-md rounded-2xl shadow-xl"
      >
        <RenderForm wrapperClass="space-y-5">
          <RenderFormFields
            fields={authenticateFields}
            wrapperClass="flex flex-col gap-1"
          />

          <RenderFormButton buttonLabel="Login" onSubmit={handleLogin} />
        </RenderForm>
        {/* 🚀 New section */}
        <p className="text-center text-sm text-gray-600">
          No account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </RenderCard>
    </div>
  );
};
export default LoginPage;
