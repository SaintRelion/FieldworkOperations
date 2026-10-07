export interface Accomplishment {
  id: string;
  userId: string;
  image: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}
export interface CreateAccomplishment {
  userId: string;
  image: string;
  description: string;
  date: string;
}
