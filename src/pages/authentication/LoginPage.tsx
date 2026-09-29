import { useAuth } from "@saintrelion/auth-lib";
import { RenderForm, RenderFormButton, RenderFormField } from "@saintrelion/forms";
import { ArrowUpRight } from "lucide-react";

const LoginPage = () => {
  const auth = useAuth();

  const handleLogin = async (data: Record<string, string>) => {
    await auth.login({ username: data.username, password: data.password });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f1ea] text-[#152238]">
      <header className="flex min-h-20 items-center justify-between border-b border-[#152238]/15 px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center bg-[#1677ff] text-white">
            <img src="/fieldwork-icon.svg" className="h-9 w-9" alt="" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-[-0.04em]">FIELDWORK<span className="font-normal"> / OPS</span></span>
        </div>
        <span className="hidden text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase sm:block">
          Training records & attendance
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-6 sm:px-8">
        <div className="w-full max-w-[480px]">
          <div className="mb-7 flex items-center gap-3 text-[11px] font-bold tracking-[0.22em] text-[#1677ff] uppercase">
            <span className="h-px w-8 bg-[#1677ff]" /> Workspace access
          </div>
          <h1 className="text-[clamp(2.6rem,7vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.065em]">
            Sign in to<br />Fieldwork<span className="text-[#1677ff]">.</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
            Record your shifts, review training progress, and manage the work that happens in the field.
          </p>

          <div className="mt-8 border-t border-[#152238]/20 pt-6">
            <RenderForm wrapperClassName="space-y-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.16em] text-slate-600 uppercase">Username</label>
                <RenderFormField
                  field={{ type: "text", name: "username", placeholder: "Enter your username" }}
                  inputClassName="w-full border border-[#152238]/20 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.16em] text-slate-600 uppercase">Password</label>
                <RenderFormField
                  field={{ type: "password", name: "password", placeholder: "Enter your password" }}
                  inputClassName="w-full border border-[#152238]/20 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10"
                />
              </div>
              <div className="pt-2">
                <RenderFormButton
                  buttonClassName="w-full bg-[#09111f] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#1677ff] disabled:bg-slate-400"
                  buttonLabel={auth.isLocked ? "Signing in..." : "Continue to workspace"}
                  isDisabled={auth.isLocked}
                  onSubmit={handleLogin}
                />
              </div>
            </RenderForm>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            One sign-in for interns, advisers, and administrators.
            <ArrowUpRight size={13} aria-hidden="true" />
          </p>
        </div>
      </main>

      <footer className="flex min-h-14 items-center justify-between gap-4 border-t border-[#152238]/15 px-5 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase sm:px-8 lg:px-12">
        <span>Fieldwork Operations</span>
        <span>Authorized access only</span>
      </footer>
    </div>
  );
};

export default LoginPage;
