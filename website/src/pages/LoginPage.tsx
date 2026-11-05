import { LoginForm } from "@/features/LoginPage/components/LoginForm";
import { useLoginPage } from "@/features/LoginPage/hooks/useLoginPage";
import { DemoPicker } from "@/shared/components/demo/DemoPicker";
import { exitDemo, isDemo, openDemo } from "@/shared/config/demo";
import { ArrowUpRight } from "lucide-react";

export default function LoginPage() {
  const { auth, handleLogin } = useLoginPage();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f1ea] text-[#152238]">
      <header className="flex min-h-20 items-center justify-between border-b border-[#152238]/15 px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center bg-[#1677ff] text-white">
            <img
              src="/fieldwork-icon.svg"
              className="h-9 w-9"
              alt=""
              aria-hidden="true"
            />
          </div>
          <span className="text-base font-bold tracking-[-0.04em]">
            FIELDWORK<span className="font-normal"> / OPS</span>
          </span>
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
            {isDemo ? "Try" : "Sign in to"}
            <br />
            Fieldwork<span className="text-[#1677ff]">.</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
            Record your shifts, review training progress, and manage the work
            that happens in the field.
          </p>

          <div className="mt-8 border-t border-[#152238]/20 pt-6">
            {isDemo ? (
              <DemoPicker />
            ) : (
              <LoginForm auth={auth} handleLogin={handleLogin} />
            )}
            <button
              type="button"
              onClick={isDemo ? exitDemo : openDemo}
              className="mt-5 min-h-12 w-full border border-slate-400 px-5 text-sm font-semibold hover:bg-white"
            >
              {isDemo ? "Back to sign in" : "Open demo →"}
            </button>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            One sign-in for interns, advisers, and administrators.
            <ArrowUpRight size={13} aria-hidden="true" />
          </p>
        </div>
      </main>

      <footer className="flex min-h-14 items-center justify-between gap-4 border-t border-[#152238]/15 px-5 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase sm:px-8 lg:px-12">
        <span>Fieldwork Operations</span>
        <span>{isDemo ? "Demo - sample data" : "Authorized access only"}</span>
      </footer>
    </div>
  );
}
