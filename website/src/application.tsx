import { createRoot } from "react-dom/client";
import "./main.css";

import { RouterProvider } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/AuthProvider";
import { NotificationProvider } from "@saintrelion/notifications";
import { router } from "./navigations";



import "@/sr-config";
import "@/repositories/AttendanceRepo";
import "@/repositories/AccomplishmentRepo";
import "@/repositories/InternInfoRepo";
import "@/repositories/NotificationRepo";
import "@/repositories/OjtYearlyRangeRepo";
import "@/repositories/UserRepo";
import "@/repositories/SettingsRepo";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </NotificationProvider>,
);
