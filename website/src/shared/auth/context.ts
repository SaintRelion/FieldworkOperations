import { createContext } from "react";
import type { AuthContextValue } from "@/shared/model/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);
