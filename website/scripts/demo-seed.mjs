import { pathToFileURL } from "node:url";
export const PROJECT_ID = "c-project-s-demo";
export function buildDemoSeed(referenceDate = new Date()) {
  const createdAt = "2026-01-01T00:00:00.000Z";
  const records = [];
  const add = (store, id, data) =>
    records.push({
      store: `ojt_${store}`,
      id,
      data: { id, createdAt, updatedAt: createdAt, ...data },
    });
  const profile = (id, role, department, firstName, lastName) =>
    add("User", id, {
      firstName,
      lastName,
      role,
      roles: [role],
      department,
      username: id,
      email: `${id}@example.invalid`,
      isEnabled: true,
    });
  profile("demo-admin", "admin", "BSIT", "Alex", "Morgan");
  const names = [
    ["Jamie", "Rivera"],
    ["Taylor", "Cruz"],
    ["Casey", "Reyes"],
    ["Jordan", "Santos"],
    ["Cameron", "Lopez"],
    ["Reese", "Torres"],
  ];
  for (const [deptIndex, department] of [
    "BSIT",
    "BSSW",
    "BSCRIM",
    "BTVTED",
  ].entries()) {
    profile(
      `demo-adviser-${department}`,
      "departmentadviser",
      department,
      ["Avery", "Riley", "Quinn", "Drew"][deptIndex],
      "Bennett",
    );
    profile(
      `demo-adviser-${department}-2`,
      "departmentadviser",
      department,
      ["Morgan", "Blair", "Robin", "Sam"][deptIndex],
      ["Flores", "Mendoza", "Garcia", "Ramos"][deptIndex],
    );
    add("Settings", `demo-settings-${department}`, {
      department,
      timeIn: "08:00",
      timeOut: "17:00",
      gracePeriodMinutes: 15,
    });
    for (let index = 0; index < 6; index++) {
      const id = `demo-intern-${department}-${index + 1}`;
      profile(
        id,
        "intern",
        department,
        names[index][0],
        index < 4 ? names[(index + deptIndex) % 4][1] : names[index][1],
      );
      add("InternInfo", `demo-info-${id}`, {
        userId: id,
        schoolYear: "2026-2027",
        trainingCompany: [
          "Northstar Studio",
          "Community Works",
          "Civic Services",
          "Learning Workshop",
        ][deptIndex],
        remainingHours: String(400 - index * 24),
        requiredHours: "480",
        accomplished: false,
        unexcusedAbsences: "0",
        tardinessCount: "0",
      });
      for (let day = 1; day <= 3; day++) {
        const date = new Date(referenceDate);
        date.setUTCDate(date.getUTCDate() - day);
        const dateKey = date.toISOString().slice(0, 10);
        for (const [step, type] of [
          "time-in",
          "break-out",
          "break-in",
          "time-out",
        ].entries()) {
          add("Attendance", `demo-${id}-${day}-${type}`, {
            userId: id,
            type,
            attribute: "",
            evaluated: day !== 1,
            image: "/demo-capture.svg",
            location: [0, 0],
            createdAt: `${dateKey}T${["08:00", "12:00", "13:00", "17:00"][step]}:00+08:00`,
          });
        }
        add("Accomplishments", `demo-work-${id}-${day}`, {
          userId: id,
          date: dateKey,
          image: "/demo-capture.svg",
          description: [
            "Organized training materials and documented assigned tasks.",
            "Assisted a supervised field activity and prepared a summary.",
            "Reviewed completed work with my supervisor and recorded next steps.",
          ][day - 1],
        });
      }
    }
  }
  return records;
}
function firestoreValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number")
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  if (Array.isArray(value))
    return { arrayValue: { values: value.map(firestoreValue) } };
  throw new Error("Unsupported seed value.");
}
export async function seedDemo(args = process.argv.slice(2)) {
  if (
    args.some((arg) => !["--write", "--project=c-project-s-demo"].includes(arg))
  )
    throw new Error(
      "Only --write and --project=c-project-s-demo are accepted.",
    );
  const records = buildDemoSeed();
  console.log(
    `Target: ${PROJECT_ID}. ${records.length} fictional records; 1 admin, 8 advisers, 24 interns.`,
  );
  if (!args.includes("--write")) {
    console.log(
      "Preview only. Add --write with FIREBASE_ACCESS_TOKEN to seed. No Auth accounts are created.",
    );
    return;
  }
  const token = process.env.FIREBASE_ACCESS_TOKEN;
  if (!token)
    throw new Error(
      "Set FIREBASE_ACCESS_TOKEN to a short-lived Google OAuth token with Firestore access to the demo project.",
    );
  const database = `projects/${PROJECT_ID}/databases/(default)`;
  const writes = records.map(({ store, id, data }) => ({
    update: {
      name: `${database}/documents/${store}/${id}`,
      fields: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          firestoreValue(value),
        ]),
      ),
    },
  }));
  const response = await fetch(
    `https://firestore.googleapis.com/v1/${database}/documents:commit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ writes }),
    },
  );
  if (!response.ok)
    throw new Error(
      `Demo seed failed (${response.status}). Check demo project permissions. No credentials are logged.`,
    );
  console.log(
    "Demo seed committed. Stable IDs replace the same fictional records on repeat runs; visitor records are untouched.",
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  seedDemo().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
