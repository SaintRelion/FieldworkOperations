import UserMenu from "./UserMenu";
// import NotificationPopup from "./NotificationPopup";

import { Menu } from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import type { UserRole } from "@/models/userrole";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@saintrelion/auth-lib";

const navItems: Record<UserRole, { label: string; path: string }[]> = {
  superadmin: [{ label: "Department Admins", path: "/departmentadmins" }],

  departmentadmin: [
    { label: "Dashboard", path: "/" },
    { label: "Advisers", path: "/advisers" },
    { label: "Settings", path: "/settings" },
  ],

  adviser: [
    { label: "Dashboard", path: "/" },
    { label: "Interns", path: "/interns" },
  ],

  intern: [
    { label: "Dashboard", path: "/" },
    { label: "Attendance Record", path: "/attendancerecord" },
  ],
};

const SpecialHeader = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Navbar */}
      <aside
        className={`fixed z-40 w-60 border-r bg-white p-4 shadow-md transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } max-lg:h-full lg:relative`}
      >
        <div className="mb-8 flex items-center justify-between lg:block">
          <div className="text-xl font-bold text-blue-600">OJT Monitor</div>
          <button
            className="text-gray-600 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          {navItems[user.role as UserRole].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",

                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary",
                )}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="w-full">
        {/* Header */}
        <header className="flex h-15 w-full items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              className="text-black lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* <NotificationPopup role="adviser" /> */}
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <div className="min-h-screen p-6">{children}</div>
      </div>
    </>
  );
};
export default SpecialHeader;
