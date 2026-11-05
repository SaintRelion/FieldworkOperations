import { Home, GuestOnly, RoleOnly } from "@/app/components/RouteGuards";
import AccomplishmentsPage from "@/pages/AccomplishmentsPage";
import AccountPage from "@/pages/AccountPage";
import AttendanceRecordPage from "@/pages/AttendanceRecordPage";
import DepartmentAdviserDashboardPage from "@/pages/DepartmentAdviserDashboardPage";
import DepartmentAdviserManagementPage from "@/pages/DepartmentAdviserManagementPage";
import DepartmentAttendanceEvaluationPage from "@/pages/DepartmentAttendanceEvaluationPage";
import InternDashboardPage from "@/pages/InternDashboardPage";
import InternManagementPage from "@/pages/InternManagementPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import SettingsPage from "@/pages/SettingsPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  {
    element: <GuestOnly />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
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
      { index: true, element: <DepartmentAdviserDashboardPage /> },
      { path: "interns", element: <InternManagementPage /> },
      { path: "attendance", element: <DepartmentAttendanceEvaluationPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/intern",
    element: <RoleOnly role="intern" />,
    children: [
      { index: true, element: <InternDashboardPage /> },
      { path: "attendancerecord", element: <AttendanceRecordPage /> },
      { path: "accomplishment", element: <AccomplishmentsPage /> },
      { path: "account", element: <AccountPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
