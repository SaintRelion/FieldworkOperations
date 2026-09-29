import { type ReactNode, useState } from "react";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { NavLink } from "react-router-dom";
import { Menu, Orbit, X } from "lucide-react";
import type { User } from "@/models/User";
import UserMenu from "./UserMenu";

const linksByRole: Record<string, { label: string; to: string; end?: boolean }[]> = {
  intern: [
    { label: "Today", to: "/intern", end: true },
    { label: "Attendance", to: "/intern/attendancerecord" },
    { label: "Accomplishments", to: "/intern/accomplishment" },
    { label: "My account", to: "/intern/account" },
  ],
  departmentadviser: [
    { label: "Overview", to: "/departmentadviser", end: true },
    { label: "Interns", to: "/departmentadviser/interns" },
    { label: "Review attendance", to: "/departmentadviser/attendance" },
    { label: "Shift rules", to: "/departmentadviser/settings" },
    { label: "My account", to: "/departmentadviser/account" },
  ],
  admin: [
    { label: "Advisers", to: "/admin", end: true },
    { label: "Interns", to: "/admin/interns" },
    { label: "My account", to: "/admin/account" },
  ],
};

const roleNames: Record<string, string> = {
  intern: "Intern workspace",
  departmentadviser: "Adviser workspace",
  admin: "Administration",
};

export const SpecialHeader = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser<User>();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = user.roles?.[0] ?? "";
  const links = linksByRole[role] ?? [];

  return (
    <div className="app-shell min-h-screen w-full min-w-0 bg-[#f4f1ea] text-[#152238]">
      <header className="relative z-30 bg-[#09111f] text-white">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center gap-6 px-5 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center bg-[#1677ff] text-white">
              <Orbit size={20} strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-[-0.03em]">FIELDWORK / OPS</p>
              <p className="truncate text-[10px] tracking-[0.13em] text-slate-400 uppercase">{roleNames[role] ?? "Workspace"}</p>
            </div>
          </div>

          <nav className="ml-auto hidden h-[76px] items-stretch gap-1 lg:flex" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `flex items-center border-b-2 px-4 text-sm font-medium transition-colors ${isActive ? "border-[#f4b740] text-white" : "border-transparent text-slate-400 hover:text-white"}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-5">
            <span className="hidden max-w-44 truncate border-l border-white/15 pl-5 text-xs text-slate-300 sm:block">
              {user.firstName} {user.lastName}
            </span>
            <UserMenu />
            <button
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center border border-white/20 text-slate-200 lg:hidden"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 px-5 py-3 lg:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-[1500px] gap-1 sm:grid-cols-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `border-l-2 px-4 py-3 text-sm ${isActive ? "border-[#f4b740] bg-white/10 text-white" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-5 py-8 md:px-8 md:py-10 lg:px-10">
        {children}
      </main>
    </div>
  );
};
