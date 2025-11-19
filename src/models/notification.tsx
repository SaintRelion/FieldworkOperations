export interface Notification {
  id: string;
  recepientId: string;
  message: string;
  type: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}
