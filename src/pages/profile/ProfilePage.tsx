import type { JSX } from "react";
import StudentProfilePage from "./intern";
import { useAuth } from "@saintrelion/auth-lib";
import DepartmentAdviserProfilePage from "./departmentadviser";
import type { UserRole } from "@/model_types/userrole";

const ProfilePage = () => {
  const { user } = useAuth();

  const profilePages: Record<string, JSX.Element> = {
    departmentadmin: <DepartmentAdviserProfilePage />,
    intern: <StudentProfilePage />,
  };

  return profilePages[user.role as UserRole];
};
export default ProfilePage;
