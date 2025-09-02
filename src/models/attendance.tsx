export interface AttendanceLog {
  id: number;
  userID: number;
  type: string;
  timeDateISO: string;
  location: number[];
  image: string;
}
