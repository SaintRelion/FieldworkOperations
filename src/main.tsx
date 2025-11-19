import { createRoot } from "react-dom/client";
import "./main.css";

import { RouterProvider } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@saintrelion/auth-lib";
import { NotificationProvider } from "@saintrelion/notifications";
import { router } from "./navigations";

import "@/lib/firebase-client";

import "@/data-access-config";
import "@/repositories/attendance";
import "@/repositories/intern-info";
import "@/repositories/notification";
import "@/repositories/ojt-yearly-range";
import "@/repositories/user";
import "@/repositories/settings";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </NotificationProvider>,
);
