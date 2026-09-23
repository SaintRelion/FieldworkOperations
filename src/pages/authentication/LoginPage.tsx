import { useAuth } from "@saintrelion/auth-lib";
import {
  RenderForm,
  RenderFormButton,
  RenderFormField,
} from "@saintrelion/forms";
import { Users } from "lucide-react";

const LoginPage = () => {
  const auth = useAuth();

  const handleLogin = async (data: Record<string, string>) => {
    await auth.login({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f0f9f4]">
      <div className="w-full max-w-sm px-6">
        {/* Simple Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <Users size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            OJT & Instructor <span className="text-emerald-600">Portal</span>
          </h1>
          <p className="mt-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Sign in to continue
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
          <RenderForm wrapperClassName="space-y-5">
            <div className="space-y-1">
              <label className="ml-1 text-[11px] font-black tracking-wider text-emerald-700/70 uppercase">
                Username
              </label>
              <RenderFormField
                field={{
                  type: "text",
                  name: "username",
                  placeholder: "Enter username",
                }}
                inputClassName="w-full rounded-xl border border-emerald-50 bg-emerald-50/30 px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="ml-1 text-[11px] font-black tracking-wider text-emerald-700/70 uppercase">
                Password
              </label>
              <RenderFormField
                field={{
                  type: "password",
                  name: "password",
                  placeholder: "Enter password",
                }}
                inputClassName="w-full rounded-xl border border-emerald-50 bg-emerald-50/30 px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <RenderFormButton
                buttonClassName="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:bg-slate-300 shadow-lg shadow-slate-200"
                buttonLabel={auth.isLocked ? "Verifying..." : "Login"}
                isDisabled={auth.isLocked}
                onSubmit={handleLogin}
              />
            </div>
          </RenderForm>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold tracking-[0.3em] text-emerald-800/30 uppercase">
          Attendance System v2.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
