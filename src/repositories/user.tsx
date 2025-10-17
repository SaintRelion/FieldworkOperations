import type { User } from "@/models/user";
import { firebaseRegister, mockRegister } from "@saintrelion/data-access-layer";

// #region Firebase
firebaseRegister("User");

// #region Mock
mockRegister<User>("User", [
  // 🟣 Super Admins
  {
    id: "6",
    name: "Super Admin",
    email: "super.admin@univ.edu",
    department: "CCS", // ✅ null/none for superadmin
    role: "superadmin",
    isEnabled: true,
  },

  // 🟠 Department Adviser
  {
    id: "3",
    name: "Engr. Ana Lopez",
    email: "ana.lopez@univ.edu",
    department: "COE",
    role: "departmentadviser",
    isEnabled: true,
  },
  {
    id: "4",
    name: "Mr. Carlo Ramos",
    email: "carlo.ramos@univ.edu",
    department: "CCS",
    role: "departmentadviser",
    isEnabled: true,
  },

  // 🟡 Interns
  {
    id: "7",
    name: "Mark Reyes",
    email: "mark.reyes@student.edu",
    department: "CCS",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "8",
    name: "Sophia Gomez",
    email: "sophia.gomez@student.edu",
    department: "CBA",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "9",
    name: "Liam Cruz",
    email: "liam.cruz@student.edu",
    department: "COE",
    role: "intern",
    isEnabled: false,
  },
  {
    id: "10",
    name: "Ella Santos",
    email: "ella.santos@student.edu",
    department: "CCS",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "11",
    name: "Noah Villanueva",
    email: "noah.villanueva@student.edu",
    department: "CBA",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "12",
    name: "Ava Dela Cruz",
    email: "ava.delacruz@student.edu",
    department: "CBA",
    role: "intern",
    isEnabled: true,
  },
  {
    id: "13",
    name: "Ava Dela Croos",
    email: "ava.delacroos@student.edu",
    department: "CCS",
    role: "intern",
    isEnabled: true,
  },
]);
