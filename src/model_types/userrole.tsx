export const UserRole = {
  superadmin: "Super Admin",
  departmentadviser: "Department Adviser",
  intern: "Intern",
};

export type UserRole = keyof typeof UserRole;
