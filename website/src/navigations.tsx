import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/settings/SettingsPage";
import InternManagementPage from "./pages/intern-management/InternManagementPage";
import AttendanceRecord from "./pages/attendance-record/AttendanceRecord";
import DepartmentAdviserManagementPage from "./pages/department-adviser-management/DepartmentAdviserManagementPage";
import LoginPage from "./pages/authentication/LoginPage";
import { DepartmentAdviserDashboard } from "./pages/dashboard/DepartmentAdviserDashboardPage";
import InternDashboardPage from "./pages/dashboard/InternDashboardPage";
import BaseLayout from "./layout/BaseLayout";
import DepartmentAttendanceEvaluation from "./pages/attendance-evaluation/DepartmentAttendanceEvaluation";
import AccountPage from "./pages/account/AccountPage";
import OJTAccomplishments from "./pages/accomplishment/OJTAccomplishments";

const homeByRole: Record<string, string> = {
  admin: "/admin",
  departmentadviser: "/departmentadviser",
  intern: "/intern",
};

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homeByRole[user.roles?.[0]] ?? "/login" : "/login"} replace />;
}

function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to={homeByRole[user.roles?.[0]] ?? "/"} replace /> : <Outlet />;
}

function RoleOnly({ role }: { role: string }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles?.[0] !== role) return <Navigate to={homeByRole[user.roles?.[0]] ?? "/login"} replace />;
  return <BaseLayout />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { element: <GuestOnly />, children: [{ path: "/login", element: <LoginPage /> }] },
  {
    path: "/admin",
    element: <RoleOnly role="admin" />,
    children: [
      { index: true, element: <DepartmentAdviserManagementPage /> },
      { path: "interns", element: <InternManagementPage /> },
      { path: "account", element: <AccountPage /> },
    ],
  },
  {
    path: "/departmentadviser",
    element: <RoleOnly role="departmentadviser" />,
    children: [
      { index: true, element: <DepartmentAdviserDashboard /> },
      { path: "interns", element: <InternManagementPage /> },
      { path: "attendance", element: <DepartmentAttendanceEvaluation /> },
      { path: "account", element: <AccountPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/intern",
    element: <RoleOnly role="intern" />,
    children: [
      { index: true, element: <InternDashboardPage /> },
      { path: "attendancerecord", element: <AttendanceRecord /> },
      { path: "accomplishment", element: <OJTAccomplishments /> },
      { path: "account", element: <AccountPage /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
