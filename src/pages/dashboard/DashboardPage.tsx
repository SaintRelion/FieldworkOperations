import { DepartmentAdminDashboard } from "@/pages/dashboard/departmentadmin";
import AdviserDashboard from "@/pages/dashboard/adviser";
import type { JSX } from "react";
import InternDashboardPage from "./intern";
import { useAuth } from "@saintrelion/auth-lib";
import type { UserRole } from "@/models/userrole";

const DashboardPage = () => {
  const { user } = useAuth();

  const dashboardPages: Record<string, JSX.Element> = {
    departmentadmin: <DepartmentAdminDashboard />,
    adviser: <AdviserDashboard />,
    intern: <InternDashboardPage />,
  };

  return dashboardPages[user.role as UserRole];
};
export default DashboardPage;
