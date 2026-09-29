import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("vite"))("esbuild");

process.env.TZ = "Asia/Manila";
const result = await build({
  stdin: {
    contents: 'export * from "./src/lib/attendance.ts"; export * from "./src/lib/dtr.ts";',
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { attendanceDateKey, attendanceOutcome, sessionAttendance, dtrAttendanceMap, dtrMonths, dtrDay } =
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

const log = (type, date, overrides = {}) => ({
  id: type, userId: "intern-1", type, createdAt: date,
  evaluated: false, attribute: "", image: "", location: [0, 0], ...overrides,
});
const localTime = (day, hour) => new Date(2026, 8, day, hour).toISOString();

test("DTR maps all four weekday slots from unsorted attendance", () => {
  const logs = [log("time-out", localTime(28, 17)), log("time-in", localTime(28, 8)),
    log("break-in", localTime(28, 13)), log("break-out", localTime(28, 12))];
  const row = dtrDay(new Date(2026, 8, 1), 28, "2026-09-01", "2026-09-30", dtrAttendanceMap(logs));
  assert.equal(row.timeIn, localTime(28, 8));
  assert.equal(row.breakOut, localTime(28, 12));
  assert.equal(row.breakIn, localTime(28, 13));
  assert.equal(row.timeOut, localTime(28, 17));
});

test("DTR includes recorded weekend shifts rather than replacing them with a weekend label", () => {
  const map = dtrAttendanceMap([log("time-in", localTime(26, 8))]);
  assert.equal(dtrDay(new Date(2026, 8, 1), 26, "2026-09-01", "2026-09-30", map).showWeekend, false);
  assert.equal(dtrDay(new Date(2026, 8, 1), 27, "2026-09-01", "2026-09-30", map).showWeekend, true);
});

test("Firestore timestamps use the local calendar date, including early-morning entries", () => {
  const seconds = new Date(2026, 8, 28, 1).getTime() / 1000;
  const timestamp = { seconds, nanoseconds: 0 };
  assert.equal(attendanceDateKey(timestamp), "2026-09-28");
  const map = dtrAttendanceMap([log("time-in", timestamp)]);
  assert.equal(dtrDay(new Date(2026, 8, 1), 28, "2026-09-01", "2026-09-30", map).timeIn, timestamp);
});

test("DTR handles multiple months, date boundaries, incomplete days and invalid month dates", () => {
  assert.deepEqual(dtrMonths("2026-09-28", "2026-11-02").map(attendanceDateKey), ["2026-09-01", "2026-10-01", "2026-11-01"]);
  assert.deepEqual(dtrMonths("2026-09-30", "2026-09-01"), []);
  const map = dtrAttendanceMap([log("time-in", localTime(28, 8))]);
  assert.equal(dtrDay(new Date(2026, 8, 1), 28, "2026-09-29", "2026-09-30", map).timeIn, undefined);
  assert.equal(dtrDay(new Date(2026, 8, 1), 28, "2026-09-28", "2026-09-28", map).timeOut, undefined);
  assert.equal(dtrDay(new Date(2026, 1, 1), 31, "2026-02-01", "2026-02-28", {}).valid, false);
});

test("Student outcomes distinguish absent, tardy, excused, cleared and pending", () => {
  for (const [attribute, expected] of [["absent", "Absent"], ["tardy", "Tardy"], ["excused", "Excused"], ["", "Cleared"]]) {
    assert.equal(attendanceOutcome({ attribute, evaluated: true }).label, expected);
  }
  assert.equal(attendanceOutcome({ attribute: "", evaluated: false }).label, "Awaiting review");
});

test("Legacy reviewed exit logs inherit only their own reviewed session outcome", () => {
  const entry = log("time-in", localTime(28, 8), { evaluated: true, attribute: "tardy" });
  const exit = log("break-out", localTime(28, 12), { evaluated: true });
  assert.equal(sessionAttendance(exit, [entry, exit]).attribute, "tardy");
  assert.equal(sessionAttendance({ ...exit, evaluated: false }, [entry]).attribute, "");
  assert.equal(sessionAttendance({ ...exit, userId: "another-intern" }, [entry]).attribute, "");
  assert.equal(sessionAttendance({ ...exit, createdAt: localTime(29, 12) }, [entry]).attribute, "");
  assert.equal(sessionAttendance({ ...exit, attribute: "excused" }, [entry]).attribute, "excused");
});
