import { useContext } from "react";
import { AuthContext } from "@/shared/auth/context";
import type { User } from "@/shared/model/User";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is missing.");
  return context;
}

export function useCurrentUser<T extends User = User>(): T {
  const { user } = useAuth();
  if (!user) throw new Error("A signed-in user is required.");
  return user as T;
}
