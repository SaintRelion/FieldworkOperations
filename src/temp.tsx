import { useAuth } from "@saintrelion/auth-lib";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || user.email == "fake") return <Navigate to="/login" replace />;
  return children;
}
