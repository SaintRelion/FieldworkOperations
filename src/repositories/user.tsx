import type { User } from "@/models/user";
import { firebaseRegister, mockRegister } from "@saintrelion/data-access-layer";

// #region Firebase
firebaseRegister("User");

// #region Mock
mockRegister<User>("User", [
  // 🟣 Super Admins
  {
    id: "6",
    firstName: "Super Admin",
    lastName: "Last",
    email: "super.admin@univ.edu",
    department: "CCS", // ✅ null/none for superadmin
    role: "superadmin",
    isEnabled: true,
  },

  // 🟠 Department Adviser
  {
    id: "3",
    firstName: "Engr. Ana Lopez",
    lastName: "Last",
    email: "ana.lopez@univ.edu",
    department: "COE",
    role: "departmentadviser",
    isEnabled: true,
  },
  {
    id: "4",
    firstName: "Mr. Carlo Ramos",
    lastName: "Last",
    email: "carlo.ramos@univ.edu",
    department: "CCS",
    role: "departmentadviser",
    isEnabled: true,
  },

  // 🟡 Interns
  {
    id: "7",
    firstName: "Mark Reyes",
    lastName: "Last",
    email: "mark.reyes@student.edu",
    department: "CCS",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "8",
    firstName: "Sophia Gomez",
    lastName: "Last",
    email: "sophia.gomez@student.edu",
    department: "CBA",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "9",
    firstName: "Liam Cruz",
    lastName: "Last",
    email: "liam.cruz@student.edu",
    department: "COE",
    role: "intern",
    isEnabled: false,
  },
  {
    id: "10",
    firstName: "Ella Santos",
    lastName: "Last",
    email: "ella.santos@student.edu",
    department: "CCS",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "11",
    firstName: "Noah Villanueva",
    lastName: "Last",
    email: "noah.villanueva@student.edu",
    department: "CBA",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "12",
    firstName: "Ava Dela Cruz",
    lastName: "Last",
    email: "ava.delacruz@student.edu",
    department: "CBA",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "13",
    firstName: "Ava Dela Croos",
    lastName: "Last",
    email: "ava.delacroos@student.edu",
    department: "CCS",
    role: "intern",
    isEnabled: true,
  },
]);
