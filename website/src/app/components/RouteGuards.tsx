import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import BaseLayout from "@/app/layouts/BaseLayout";

const homeByRole: Record<string, string> = {
  admin: "/admin",
  departmentadviser: "/departmentadviser",
  intern: "/intern",
};

export function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Navigate
      to={user ? (homeByRole[user.roles?.[0]] ?? "/login") : "/login"}
      replace
    />
  );
}

export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? (
    <Navigate to={homeByRole[user.roles?.[0]] ?? "/"} replace />
  ) : (
    <Outlet />
  );
}

export function RoleOnly({ role }: { role: string }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles?.[0] !== role)
    return <Navigate to={homeByRole[user.roles?.[0]] ?? "/login"} replace />;
  return <BaseLayout />;
}
