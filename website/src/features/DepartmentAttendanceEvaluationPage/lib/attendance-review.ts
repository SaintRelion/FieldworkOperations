import type { Settings } from "@/shared/model/Settings";
import { toDate } from "@saintrelion/time-functions";

// ============================================================
// MARK: Types and constants
export const ABSENCE_RULES = {
  excused: { additionalHours: 8 },
  unexcused: { additionalHours: 16 },
  maxUnexcusedBeforeReset: 5,
};

// ============================================================
// MARK: Attendance helpers
export const getTardinessPenalty = (count: number): number => {
  const rules: Record<number, number> = { 1: 0, 2: 2, 3: 4, 4: 6 };
  return rules[count] ?? 6;
};

export const isLate = (
  slot: string,
  createdAt: string,
  settings: Settings,
): boolean => {
  const actual = toDate(createdAt);
  if (!actual) return false;
  const expectedTime = slot === "break-in" ? "13:00" : settings.timeIn;
  const [h, m] = expectedTime.split(":").map(Number);
  const expected = new Date(actual);
  expected.setHours(h, m, 0, 0);
  return actual > expected;
};
