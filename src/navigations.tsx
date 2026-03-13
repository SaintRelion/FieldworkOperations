import {
  createAppRouter,
  createRoleLayout,
  registerGroupAppRoutes,
} from "@saintrelion/routers";

import NotFound from "./pages/NotFound";

import SettingsPage from "./pages/settings/SettingsPage";
import InternManagementPage from "./pages/intern-management/InternManagementPage";
import AttendanceRecord from "./pages/attendance-record/AttendanceRecord";
import DepartmentAdviserManagementPage from "./pages/department-adviser-management/DepartmentAdviserManagementPage";
import LoginPage from "./pages/authentication/LoginPage";
import RegisterPage from "./pages/authentication/RegisterPage";
import { roleLayoutMap } from "@saintrelion/auth-lib";
import { DepartmentAdviserDashboard } from "./pages/dashboard/DepartmentAdviserDashboardPage";
import InternDashboardPage from "./pages/dashboard/InternDashboardPage";
import { PublicLayout } from "./layout/PublicLayout";
import BaseLayout from "./layout/BaseLayout";
import AdminLoginPage from "./pages/authentication/AdminLoginPage";
import DepartmentAttendanceEvaluation from "./pages/attendance-evaluation/DepartmentAttendanceEvaluation";
import AccountPage from "./pages/account/AccountPage";

roleLayoutMap[""] = {
  redirect: "/",
  layout: PublicLayout,
};
registerGroupAppRoutes({
  path: "/",
  layout: createRoleLayout(""),
  errorElement: <NotFound />,
  children: [
    { path: "login", auth: true, element: <LoginPage /> },
    { path: "register", auth: true, element: <RegisterPage /> },
    { path: "admin/login", public: true, element: <AdminLoginPage /> },
  ],
});

roleLayoutMap["admin"] = {
  redirect: "/admin",
  layout: BaseLayout,
};
registerGroupAppRoutes({
  path: "/admin",
  layout: createRoleLayout("admin"),
  errorElement: <NotFound />,
  children: [
    {
      index: true,
      element: <DepartmentAdviserManagementPage />,
      label: "Department Advisers",
      allowedRoles: ["admin"],
    },
  ],
});

roleLayoutMap["departmentadviser"] = {
  redirect: "/departmentadviser",
  layout: BaseLayout,
};
registerGroupAppRoutes({
  path: "/departmentadviser",
  layout: createRoleLayout("departmentadviser"),
  errorElement: <NotFound />,
  children: [
    {
      index: true,
      element: <DepartmentAdviserDashboard />,
      label: "Dashboard",
      allowedRoles: ["departmentadviser"],
    },
    {
      path: "interns",
      element: <InternManagementPage />,
      label: "Interns",
      allowedRoles: ["departmentadviser"],
    },
    {
      path: "attendance",
      element: <DepartmentAttendanceEvaluation />,
      label: "Attendance",
      allowedRoles: ["departmentadviser"],
    },
    {
      path: "account",
      element: <AccountPage />,
      label: "Account",
      allowedRoles: ["departmentadviser"],
    },
    {
      path: "settings",
      element: <SettingsPage />,
      label: "Settings",
      allowedRoles: ["departmentadviser"],
    },
  ],
});

roleLayoutMap["intern"] = {
  redirect: "/intern",
  layout: BaseLayout,
};

registerGroupAppRoutes({
  path: "/intern",
  layout: createRoleLayout("intern"),
  errorElement: <NotFound />,
  children: [
    {
      index: true,
      element: <InternDashboardPage />,
      label: "Dashboard",
      allowedRoles: ["intern"],
    },
    {
      path: "attendancerecord",
      element: <AttendanceRecord />,
      label: "Attendance Record",
      allowedRoles: ["intern"],
    },
    {
      path: "account",
      element: <AccountPage />,
      label: "Account",
      allowedRoles: ["intern"],
    },
  ],
});

export const router = createAppRouter();
