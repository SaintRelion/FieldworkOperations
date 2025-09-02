import type { Department } from "./department";
import type { UserRole } from "./userrole";

export interface BaseUser {
  // Admin and Adviser stays here
  id: number;
  name: string;
  email: string;
  department: Department;
  role: UserRole;
  isEnabled: boolean;
}
