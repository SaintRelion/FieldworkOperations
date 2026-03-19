import { type ReactNode, useState } from "react";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { Menu, X } from "lucide-react";
import type { User } from "@/models/User";
import { renderNavItems } from "@saintrelion/routers";
import UserMenu from "./UserMenu";

export const SpecialHeader = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser<User>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Base Background: A soft, non-white Mint-Slate
    <div className="flex min-h-screen w-full bg-[#EDF2F0]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Deep Charcoal/Slate-900 for high contrast */}
      <aside
        className={`fixed z-40 h-full w-64 bg-[#0F172A] p-6 text-slate-300 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-2xl shadow-black/20`}
      >
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20" />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>
            <div className="text-xl font-black tracking-tighter text-white">
              OJT<span className="text-emerald-400">LOG</span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col space-y-1">
          <p className="mb-3 px-4 text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
            Navigation
          </p>
          {renderNavItems({
            role: user.roles ? user.roles[0] : "",
            baseClassName:
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all text-slate-400 hover:bg-white/5 hover:text-emerald-400 group",
            activeClassName:
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 pointer-events-none",
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="absolute right-6 bottom-8 left-6 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-black text-emerald-400">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-black text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase">
                Verified Access
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex flex-1 flex-col">
        {/* Transparent Glass Header */}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between bg-[#EDF2F0]/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <h1 className="text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
                System Environment /{" "}
                <span className="text-slate-900">
                  {user.roles?.[0] || "Guest"}
                </span>
              </h1>
            </div>
          </div>
          <UserMenu />
        </header>

        {/* The Page Content Area */}
        <main className="p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
