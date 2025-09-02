import type { JSX } from "react";
import StudentProfilePage from "./intern";
import AdviserProfilePage from "./adviser";
import { useAuth } from "@saintrelion/auth-lib";
import DepartmentAdminProfilePage from "./departmentadmin";
import type { UserRole } from "@/models/userrole";

const ProfilePage = () => {
  const { user } = useAuth();

  const profilePages: Record<string, JSX.Element> = {
    departmentadmin: <DepartmentAdminProfilePage />,
    adviser: <AdviserProfilePage />,
    intern: <StudentProfilePage />,
  };

  return profilePages[user.role as UserRole];
};
export default ProfilePage;
