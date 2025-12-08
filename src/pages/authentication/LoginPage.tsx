import { useAuth, useLoginWithCredentials } from "@saintrelion/auth-lib";
import {
  RenderForm,
  RenderFormButton,
  RenderFormField,
} from "@saintrelion/forms";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const loginWithCredentials = useLoginWithCredentials();

  const handleLogin = async (data: Record<string, string>) => {
    // Normally you'd call API here, then save returned user
    console.log("Raw submission:", data);

    await loginWithCredentials.run(
      "email",
      data.email,
      data.password,
      setUser,
      (loggedInUser) => {
        if (loggedInUser.role == "superadmin")
          navigate("/departmentadvisers"); // redirect to dashboard
        else navigate("/");
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
      <div className="flex flex-col">
        <h1 className="text-center text-2xl font-bold">Login</h1>
        <RenderForm wrapperClass="w-full min-w-sm rounded-2xl space-y-2">
          <RenderFormField
            field={{
              label: "Email",
              type: "email",
              name: "email",
            }}
            inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          />

          <RenderFormField
            field={{ label: "Password", type: "password", name: "password" }}
            inputClassName="w-full rounded-md border border-gray-300 py-1 pl-2 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          />

          <RenderFormButton
            buttonClassName="w-full rounded-lg bg-blue-600 py-2 font-semibold  transition-colors hover:bg-blue-700"
            buttonLabel="Login"
            isDisabled={loginWithCredentials.isLocked}
            onSubmit={handleLogin}
          />
        </RenderForm>

        <p className="mt-2 text-center text-sm text-gray-600">
          No account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
