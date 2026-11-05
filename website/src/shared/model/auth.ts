import type { User } from "@/shared/model/User";

export type NewUser = Pick<
  User,
  "firstName" | "lastName" | "username" | "email" | "department"
> & {
  role: "intern" | "departmentadviser";
};

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authUid: string | null;
  selectPersona: (id: string) => Promise<void>;
  isLocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (info: NewUser, password: string) => Promise<string>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
};
