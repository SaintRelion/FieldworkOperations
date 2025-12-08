import { createAppRouter, registerGroupAppRoutes } from "@saintrelion/routers";

import RootLayout from "@/layout/RootLayout";
import NotFound from "./pages/NotFound";

import SettingsPage from "./pages/settings/SettingsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import InternManagementPage from "./pages/intern-management/InternManagementPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AttendanceRecord from "./pages/attendance-record/AttendanceRecord";
import DepartmentAdviserManagementPage from "./pages/department-adviser-management/DepartmentAdviserManagementPage";
import LoginPage from "./pages/authentication/LoginPage";
import RegistrationPage from "./pages/authentication/RegistrationPage";
import { ProtectedRoute } from "@saintrelion/auth-lib";

registerGroupAppRoutes({
  layout: (
    <ProtectedRoute>
      <RootLayout />
    </ProtectedRoute>
  ),
  path: "/",
  errorElement: <NotFound />,
  children: [
    // PUBLIC
    { path: "/login", public: true, element: <LoginPage /> },
    { path: "/register", public: true, element: <RegistrationPage /> },
    // RESTRICTED
    {
      index: true,
      path: "/",
      element: <DashboardPage />,
      label: "Dashboard",
      allowedRoles: ["departmentadviser", "intern"],
    },
    {
      path: "/departmentadvisers",
      element: <DepartmentAdviserManagementPage />,
      label: "Department Advisers",
      allowedRoles: ["superadmin"],
    },
    {
      path: "/interns",
      element: <InternManagementPage />,
      label: "Interns",
      allowedRoles: ["departmentadviser"],
    },
    {
      path: "/attendancerecord",
      element: <AttendanceRecord />,
      label: "Attendance Record",
      allowedRoles: ["intern"],
    },
    { path: "/profile", element: <ProfilePage /> },
    {
      path: "/settings",
      element: <SettingsPage />,
      label: "Settings",
      allowedRoles: ["departmentadviser"],
    },
  ],
});

export const router = createAppRouter();
