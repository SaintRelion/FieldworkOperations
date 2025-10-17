export interface AttendanceLog {
  id: string;
  userID: string;
  type: string;
  timeDateISO: string;
  location: number[];
  image: string;
}
