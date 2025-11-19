import type { AttendanceLog } from "@/models/attendance";
import { firebaseRegister, mockRegister } from "@saintrelion/data-access-layer";

// #region Firebase
firebaseRegister("AttendanceLog");

// #region API

// #region Mock
mockRegister<AttendanceLog>("AttendanceLog", [
  // User 7 - Manila
  {
    id: "1",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "in",
    location: [14.5995, 120.9842],
    image: "https://picsum.photos/200/120?random=1",
    createdAt: "2025-08-19 08:05:23",
  },
  {
    id: "2",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "out",
    location: [14.6, 120.985],
    image: "https://picsum.photos/200/120?random=2",
    createdAt: "2025-08-19 12:00:45",
  },
  {
    id: "3",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "in",
    location: [14.5998, 120.9848],
    image: "https://picsum.photos/200/120?random=3",
    createdAt: "2025-08-20 08:15:10",
  },
  {
    id: "4",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "out",
    location: [14.6002, 120.9855],
    image: "https://picsum.photos/200/120?random=4",
    createdAt: "2025-08-20 17:05:55",
  },
  {
    id: "5",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "update",
    location: [14.601, 120.986],
    image: "https://picsum.photos/200/120?random=5",
    createdAt: "2025-08-21 09:30:00",
  },

  // User 8 - Cebu
  {
    id: "6",
    userID: "8",
    type: "in",
    location: [10.3157, 123.8854],
    image: "https://picsum.photos/200/120?random=6",
    createdAt: "2025-08-19 08:10:11",
  },
  {
    id: "7",
    userID: "8",
    type: "out",
    location: [10.3165, 123.887],
    image: "https://picsum.photos/200/120?random=7",
    createdAt: "2025-08-19 16:00:00",
  },
  {
    id: "8",
    userID: "8",
    type: "in",
    location: [10.317, 123.8865],
    image: "https://picsum.photos/200/120?random=8",
    createdAt: "2025-08-20 08:20:45",
  },
  {
    id: "9",
    userID: "8",
    type: "out",
    location: [10.318, 123.8878],
    image: "https://picsum.photos/200/120?random=9",
    createdAt: "2025-08-20 16:05:22",
  },
  {
    id: "10",
    userID: "8",
    type: "update",
    location: [10.319, 123.889],
    image: "https://picsum.photos/200/120?random=10",
    createdAt: "2025-08-21 11:00:00",
  },

  // User 9 - Davao
  {
    id: "11",
    userID: "9",
    type: "in",
    location: [7.1907, 125.4553],
    image: "https://picsum.photos/200/120?random=11",
    createdAt: "2025-08-17 09:00:00",
  },
  {
    id: "12",
    userID: "9",
    type: "out",
    location: [7.1915, 125.456],
    image: "https://picsum.photos/200/120?random=12",
    createdAt: "2025-08-19 17:10:30",
  },
  {
    id: "13",
    userID: "9",
    type: "in",
    location: [7.192, 125.4575],
    image: "https://picsum.photos/200/120?random=13",
    createdAt: "2025-08-20 09:05:10",
  },
  {
    id: "14",
    userID: "9",
    type: "out",
    location: [7.193, 125.4585],
    image: "https://picsum.photos/200/120?random=14",
    createdAt: "2025-08-20 17:25:40",
  },
  {
    id: "15",
    userID: "9",
    type: "update",
    location: [7.194, 125.459],
    image: "https://picsum.photos/200/120?random=15",
    createdAt: "2025-08-21 10:15:00",
  },

  // User 10 - Baguio
  {
    id: "16",
    userID: "10",
    type: "in",
    location: [16.4023, 120.596],
    image: "https://picsum.photos/200/120?random=16",
    createdAt: "2025-08-19 07:50:00",
  },
  {
    id: "17",
    userID: "10",
    type: "out",
    location: [16.403, 120.597],
    image: "https://picsum.photos/200/120?random=17",
    createdAt: "2025-08-19 17:40:10",
  },
  {
    id: "18",
    userID: "10",
    type: "in",
    location: [16.404, 120.598],
    image: "https://picsum.photos/200/120?random=18",
    createdAt: "2025-08-20 08:00:15",
  },
  {
    id: "19",
    userID: "10",
    type: "out",
    location: [16.405, 120.599],
    image: "https://picsum.photos/200/120?random=19",
    createdAt: "2025-08-20 17:20:50",
  },
  {
    id: "20",
    userID: "10",
    type: "update",
    location: [16.406, 120.6],
    image: "https://picsum.photos/200/120?random=20",
    createdAt: "2025-08-21 09:45:30",
  },

  // User 11 - Iloilo
  {
    id: "21",
    userID: "11",
    type: "in",
    location: [10.7202, 122.5621],
    image: "https://picsum.photos/200/120?random=21",
    createdAt: "2025-08-19 08:25:10",
  },
  {
    id: "22",
    userID: "11",
    type: "out",
    location: [10.721, 122.563],
    image: "https://picsum.photos/200/120?random=22",
    createdAt: "2025-08-19 17:05:55",
  },
  {
    id: "23",
    userID: "11",
    type: "in",
    location: [10.722, 122.564],
    image: "https://picsum.photos/200/120?random=23",
    createdAt: "2025-08-20 08:30:40",
  },
  {
    id: "24",
    userID: "11",
    type: "out",
    location: [10.723, 122.565],
    image: "https://picsum.photos/200/120?random=24",
    createdAt: "2025-08-20 16:55:30",
  },
  {
    id: "25",
    userID: "11",
    type: "update",
    location: [10.724, 122.566],
    image: "https://picsum.photos/200/120?random=25",
    createdAt: "2025-08-21 11:20:15",
  },

  // User 12 - Clark
  {
    id: "26",
    userID: "12",
    type: "in",
    location: [15.185, 120.56],
    image: "https://picsum.photos/200/120?random=26",
    createdAt: "2025-08-19 08:10:30",
  },
  {
    id: "27",
    userID: "12",
    type: "out",
    location: [15.186, 120.561],
    image: "https://picsum.photos/200/120?random=27",
    createdAt: "2025-08-19 16:30:45",
  },
  {
    id: "28",
    userID: "12",
    type: "in",
    location: [15.187, 120.562],
    image: "https://picsum.photos/200/120?random=28",
    createdAt: "2025-08-20 08:05:25",
  },
  {
    id: "29",
    userID: "12",
    type: "out",
    location: [15.188, 120.563],
    image: "https://picsum.photos/200/120?random=29",
    createdAt: "2025-08-20 16:45:35",
  },
  {
    id: "30",
    userID: "12",
    type: "update",
    location: [15.189, 120.564],
    image: "https://picsum.photos/200/120?random=30",
    createdAt: "2025-08-21 10:40:00",
  },
]);
