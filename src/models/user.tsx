import type { Department } from "../model_types/department";
import type { UserRole } from "../model_types/userrole";

export interface User {
  // Admin and Adviser stays here
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  role: UserRole;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
