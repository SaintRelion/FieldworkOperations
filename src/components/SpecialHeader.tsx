import UserMenu from "./UserMenu";

import { Menu } from "lucide-react";

import { useState, type ReactNode } from "react";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { renderNavItems } from "@saintrelion/routers";
import type { User } from "@/models/User";

const SpecialHeader = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser<User>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          {renderNavItems({
            role: user.roles ? user.roles[0] : "",
            baseClassName:
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all text-muted-foreground hover:bg-muted hover:text-primary",
            activeClassName:
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all bg-primary text-white pointer-events-none",
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
