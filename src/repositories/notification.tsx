import { firebaseRegister, mockRegister } from "@saintrelion/data-access-layer";
import type { Notification } from "@/models/notification";

// #region Firebase
firebaseRegister("Notification");

// #region Mock
mockRegister<Notification>("Notification", [
  {
    id: "1",
    recepientId: "1",
    message: "🎉 New Adviser registered: John Dela Cruz",
    type: "adviser_registration",
    isRead: false,
    isArchived: false,
    createdAt: "2025-07-25T09:00:00Z",
  },
  {
    id: "2",
    recepientId: "1",
    message: "🎉 New Student registered: Maria Reyes",
    type: "student_registration",
    isRead: false,
    isArchived: false,
    createdAt: "2025-07-25T11:30:00Z",
  },
  {
    id: "3",
    recepientId: "2",
    message: "📩 Naay absent for 3 days na sir",
    type: "attendance_alert",
    isRead: false,
    isArchived: false,
    createdAt: "2025-07-24T08:15:00Z",
  },
]);
