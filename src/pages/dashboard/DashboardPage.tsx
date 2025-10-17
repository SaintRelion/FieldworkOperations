import { DepartmentAdviserDashboard } from "@/pages/dashboard/departmentadviser";
import type { JSX } from "react";
import InternDashboardPage from "./intern";
import { useAuth } from "@saintrelion/auth-lib";
import type { UserRole } from "@/model_types/userrole";

const DashboardPage = () => {
  const { user } = useAuth();

  const dashboardPages: Record<string, JSX.Element> = {
    departmentadviser: <DepartmentAdviserDashboard />,
    intern: <InternDashboardPage />,
  };

  return dashboardPages[user.role as UserRole];
};
export default DashboardPage;
