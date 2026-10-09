import type { DepartmentKeys } from "../model_types/department";

export interface User {
  id: string;
  email: string;
  username: string;
  roles: string[];
  role: string;
  firstName: string;
  lastName: string;
  department: DepartmentKeys;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUser {
  department: DepartmentKeys;
  isEnabled: boolean;
}
