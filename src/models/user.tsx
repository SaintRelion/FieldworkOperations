import type { Department } from "../model_types/department";

import type { RawAuthUser } from "@saintrelion/auth-lib/dist/models/types";

export interface User extends RawAuthUser {
  firstName: string;
  lastName: string;
  department: Department;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUser {
  isEnabled: boolean;
}
