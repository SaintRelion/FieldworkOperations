import "@/app/styles.css";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { AuthProvider } from "@/shared/auth/AuthProvider";
import { NotificationProvider } from "@saintrelion/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/shared/config/data-access";
import "@/shared/config/resources/AccomplishmentRepo";
import "@/shared/config/resources/AttendanceRepo";
import "@/shared/config/resources/InternInfoRepo";
import "@/shared/config/resources/NotificationRepo";
import "@/shared/config/resources/OjtYearlyRangeRepo";
import "@/shared/config/resources/SettingsRepo";
import "@/shared/config/resources/UserRepo";

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
