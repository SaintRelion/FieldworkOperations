export interface Settings {
  id: string; // one per department (or adviser)
  department: string;
  timeIn: string; // "08:00"
  timeOut: string; // "17:00"
  gracePeriodMinutes: number; // e.g. 15
  penaltyRate: number; // e.g. 10
  createdAt: string;
  updatedAt: string;
}
