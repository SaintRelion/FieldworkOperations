import { createRoot } from "react-dom/client";
import "./main.css";
import "@/mock-registers";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@saintrelion/auth-lib";

import RootLayout from "@/layout/RootLayout";
import SettingsPage from "./pages/settings/SettingsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import NotFound from "./pages/NotFound";
import AdviserManagementPage from "./pages/adviser-management/AdviserManagementPage";
import InternManagementPage from "./pages/intern-management/InternManagementPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AttendanceRecord from "./pages/attendance-record/AttendanceRecord";
import DepartmentAdminManagementPage from "./pages/departmentadmin-management/DepartmentAdminManagementPage";
import LoginPage from "./pages/authentication/LoginPage";
import RegistrationPage from "./pages/authentication/RegistrationPage";
import { ProtectedRoute } from "./temp";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      { path: "departmentadmins", element: <DepartmentAdminManagementPage /> },
      { path: "advisers", element: <AdviserManagementPage /> },
      { path: "interns", element: <InternManagementPage /> },
      {
        path: "attendancerecord",
        element: <AttendanceRecord />,
      },
      { path: "profile", element: <ProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegistrationPage /> },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <AuthProvider
    initialUser={{
      id: 4,
      email: "fake",
      role: "adviser",
      department: "IT",
    }}
  >
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </AuthProvider>,
);
