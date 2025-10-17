import type { OjtYearlyDateRange } from "@/models/ojt-yearly-range";
import { firebaseRegister, mockRegister } from "@saintrelion/data-access-layer";

// #region Firebase
firebaseRegister("OjtYearlyDateRange");

// #region Mock
mockRegister<OjtYearlyDateRange>("OjtYearlyDateRange", [
  {
    id: "1",
    yearRange: "2022-2023",
    start: new Date("2022-04-10"),
    end: new Date("2022-06-27"),
  },
  {
    id: "2",
    yearRange: "2023-2024",
    start: new Date("2023-09-01"),
    end: new Date("2024-03-31"),
  },
  {
    id: "3",
    yearRange: "2024-2025",
    start: new Date("2024-07-01"),
    end: new Date("2024-09-30"),
  },
]);
