import type { AttendanceLog } from "@/models/attendance";
import { useAuth } from "@saintrelion/auth-lib";
import { useMockSelect } from "@saintrelion/data-access-layer";

const typeColors: Record<string, string> = {
  in: "bg-green-100 text-green-700 border-green-300",
  out: "bg-red-100 text-red-700 border-red-300",
  update: "bg-blue-100 text-blue-700 border-blue-300",
};

function formatDateTime(datetime: string) {
  const dateObj = new Date(datetime.replace(" ", "T")); // ensure valid Date
  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

const AttendanceRecord = () => {
  const { user } = useAuth();

  const { data: records = [] } = useMockSelect<AttendanceLog>(
    "AttendanceLogs",
    {
      filterFn: (log) => log.userID === user.id,
      sortFn: (a, b) =>
        new Date(b.timeDateISO).getTime() - new Date(a.timeDateISO).getTime(),
    },
  );

  const grouped = records.reduce(
    (acc, rec) => {
      const date = rec.timeDateISO.split(" ")[0]; // take only the date part
      if (!acc[date]) acc[date] = [];
      acc[date].push(rec);
      return acc;
    },
    {} as Record<string, AttendanceLog[]>,
  );

  const sortedGrouped = Object.entries(grouped).sort(
    ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime(), // DESC
  );

  return (
    <div className="rounded-md border p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Attendance Record</h2>
      {records.length === 0 ? (
        <p className="text-sm text-gray-500">No attendance found.</p>
      ) : (
        <div className="space-y-4">
          {sortedGrouped.map(([date, logs]) => (
            <div key={date}>
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                {formatDateTime(date).date}
              </h3>
              <ul className="space-y-2">
                {logs.map((rec, idx) => {
                  const { time } = formatDateTime(rec.timeDateISO);
                  return (
                    <li
                      key={idx}
                      className={`flex items-center gap-3 rounded-md border p-2 ${typeColors[rec.type] || ""}`}
                    >
                      <img
                        src={rec.image}
                        alt="Attendance snapshot"
                        width={80}
                        height={60}
                        className="rounded-md"
                      />
                      <div>
                        <p className="text-sm font-medium">{time}</p>
                        <p className="text-xs">
                          Lat: {rec.location[0]}, Lng: {rec.location[1]}
                        </p>
                        <span className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold">
                          {rec.type.toUpperCase()}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AttendanceRecord;
