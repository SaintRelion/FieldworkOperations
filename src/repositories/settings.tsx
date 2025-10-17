import type { Settings } from "@/models/settings";
import { firebaseRegister, mockRegister } from "@saintrelion/data-access-layer";

// 🔥 Register Firebase collection
firebaseRegister("Settings");

// 🟣 Mock Data for dev
mockRegister<Settings>("Settings", [
  {
    id: "1",
    department: "Computer Science",
    timeIn: "08:00",
    timeOut: "17:00",
    gracePeriodMinutes: 15,
    penaltyRate: 10,
  },
  {
    id: "2",
    department: "Information Technology",
    timeIn: "09:00",
    timeOut: "18:00",
    gracePeriodMinutes: 10,
    penaltyRate: 5,
  },
]);
