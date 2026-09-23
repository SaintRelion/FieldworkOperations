import { useAuth } from "@saintrelion/auth-lib";
import {
  RenderForm,
  RenderFormButton,
  RenderFormField,
} from "@saintrelion/forms";

const AdminLoginPage = () => {
  const auth = useAuth();

  const handleLogin = async (data: Record<string, string>) => {
    await auth.login({
      username: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="mb-4 text-center text-2xl font-bold text-slate-900">
          Admin Portal
        </h1>

        <RenderForm wrapperClassName="space-y-3">
          <RenderFormField
            field={{ label: "Admin Email", type: "email", name: "email" }}
          />

          <RenderFormField
            field={{ label: "Password", type: "password", name: "password" }}
          />

          <RenderFormButton
            buttonLabel="Login as Admin"
            isDisabled={auth.isLocked}
            onSubmit={handleLogin}
            buttonClassName="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700"
          />
        </RenderForm>
      </div>
    </div>
  );
};

export default AdminLoginPage;
