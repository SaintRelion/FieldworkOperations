export interface InternInfo {
  id: string;
  userId: string;
  program: string;
  schoolYear: string;
  trainingCompany: string;

  remainingHours: string;
  requiredHours: string;

  accomplished: boolean;

  unexcusedAbsences: string;
  tardinessCount: string;
}

export interface CreateInternInfo {
  userId: string;
  program: string;
  // schoolYear: string;
  trainingCompany: string;
  remainingHours: string;
  requiredHours: string;
  accomplished: boolean;

  unexcusedAbsences: string;
  tardinessCount: string;
}

export interface UpdateInternInfo {
  remainingHours: string;
  requiredHours: string;

  unexcusedAbsences: string;
  tardinessCount: string;
}
