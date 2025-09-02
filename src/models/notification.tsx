export interface Notification {
  id: number;
  recepientId: number;
  message: string;
  type: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string; // ISO date string
}
