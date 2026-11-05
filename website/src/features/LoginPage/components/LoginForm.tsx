import {
  RenderForm,
  RenderFormButton,
  RenderFormField,
} from "@saintrelion/forms";
import type { useLoginPage } from "@/features/LoginPage/hooks/useLoginPage";

export function LoginForm({
  auth,
  handleLogin,
}: ReturnType<typeof useLoginPage>) {
  return (
    <RenderForm wrapperClassName="space-y-5">
      <div className="space-y-2">
        <label className="block text-[11px] font-bold tracking-[0.16em] text-slate-600 uppercase">
          Email
        </label>
        <RenderFormField
          field={{
            type: "email",
            name: "email",
            placeholder: "Enter your email",
          }}
          inputClassName="w-full border border-[#152238]/20 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-bold tracking-[0.16em] text-slate-600 uppercase">
          Password
        </label>
        <RenderFormField
          field={{
            type: "password",
            name: "password",
            placeholder: "Enter your password",
          }}
          inputClassName="w-full border border-[#152238]/20 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10"
        />
      </div>
      <div className="pt-2">
        <RenderFormButton
          buttonClassName="w-full bg-[#09111f] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#1677ff] disabled:bg-slate-400"
          buttonLabel={
            auth.isLocked ? "Signing in..." : "Continue to workspace"
          }
          isDisabled={auth.isLocked}
          onSubmit={handleLogin}
        />
      </div>
    </RenderForm>
  );
}
