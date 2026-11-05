export interface Attendance {
  id: string;
  userId: string;
  type: "time-in" | "break-in" | "break-out" | "time-out";
  attribute: "excused" | "absent" | "tardy" | "";
  location: number[];
  image: string;
  evaluated: boolean;
  createdAt: string;
}

export interface CreateAttendance {
  userId: string;
  type: "time-in" | "break-in" | "break-out" | "time-out";
  attribute: "excused" | "absent" | "tardy" | "";
  location: number[];
  image: string;
  evaluated: boolean;
}

export interface UpdateAttendance {
  evaluated: boolean;
  attribute: "excused" | "absent" | "tardy" | "";
}
