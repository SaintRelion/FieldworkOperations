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
    timeDateISO: "2025-08-19 08:05:23",
    location: [14.5995, 120.9842],
    image: "https://picsum.photos/200/120?random=1",
  },
  {
    id: "2",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "out",
    timeDateISO: "2025-08-19 12:00:45",
    location: [14.6, 120.985],
    image: "https://picsum.photos/200/120?random=2",
  },
  {
    id: "3",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "in",
    timeDateISO: "2025-08-20 08:15:10",
    location: [14.5998, 120.9848],
    image: "https://picsum.photos/200/120?random=3",
  },
  {
    id: "4",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "out",
    timeDateISO: "2025-08-20 17:05:55",
    location: [14.6002, 120.9855],
    image: "https://picsum.photos/200/120?random=4",
  },
  {
    id: "5",
    userID: "OSfy0IBRXBZdHhHKR7eYMPLqAK83",
    type: "update",
    timeDateISO: "2025-08-21 09:30:00",
    location: [14.601, 120.986],
    image: "https://picsum.photos/200/120?random=5",
  },

  // User 8 - Cebu
  {
    id: "6",
    userID: "8",
    type: "in",
    timeDateISO: "2025-08-19 08:10:11",
    location: [10.3157, 123.8854],
    image: "https://picsum.photos/200/120?random=6",
  },
  {
    id: "7",
    userID: "8",
    type: "out",
    timeDateISO: "2025-08-19 16:00:00",
    location: [10.3165, 123.887],
    image: "https://picsum.photos/200/120?random=7",
  },
  {
    id: "8",
    userID: "8",
    type: "in",
    timeDateISO: "2025-08-20 08:20:45",
    location: [10.317, 123.8865],
    image: "https://picsum.photos/200/120?random=8",
  },
  {
    id: "9",
    userID: "8",
    type: "out",
    timeDateISO: "2025-08-20 16:05:22",
    location: [10.318, 123.8878],
    image: "https://picsum.photos/200/120?random=9",
  },
  {
    id: "10",
    userID: "8",
    type: "update",
    timeDateISO: "2025-08-21 11:00:00",
    location: [10.319, 123.889],
    image: "https://picsum.photos/200/120?random=10",
  },

  // User 9 - Davao
  {
    id: "11",
    userID: "9",
    type: "in",
    timeDateISO: "2025-08-17 09:00:00",
    location: [7.1907, 125.4553],
    image: "https://picsum.photos/200/120?random=11",
  },
  {
    id: "12",
    userID: "9",
    type: "out",
    timeDateISO: "2025-08-19 17:10:30",
    location: [7.1915, 125.456],
    image: "https://picsum.photos/200/120?random=12",
  },
  {
    id: "13",
    userID: "9",
    type: "in",
    timeDateISO: "2025-08-20 09:05:10",
    location: [7.192, 125.4575],
    image: "https://picsum.photos/200/120?random=13",
  },
  {
    id: "14",
    userID: "9",
    type: "out",
    timeDateISO: "2025-08-20 17:25:40",
    location: [7.193, 125.4585],
    image: "https://picsum.photos/200/120?random=14",
  },
  {
    id: "15",
    userID: "9",
    type: "update",
    timeDateISO: "2025-08-21 10:15:00",
    location: [7.194, 125.459],
    image: "https://picsum.photos/200/120?random=15",
  },

  // User 10 - Baguio
  {
    id: "16",
    userID: "10",
    type: "in",
    timeDateISO: "2025-08-19 07:50:00",
    location: [16.4023, 120.596],
    image: "https://picsum.photos/200/120?random=16",
  },
  {
    id: "17",
    userID: "10",
    type: "out",
    timeDateISO: "2025-08-19 17:40:10",
    location: [16.403, 120.597],
    image: "https://picsum.photos/200/120?random=17",
  },
  {
    id: "18",
    userID: "10",
    type: "in",
    timeDateISO: "2025-08-20 08:00:15",
    location: [16.404, 120.598],
    image: "https://picsum.photos/200/120?random=18",
  },
  {
    id: "19",
    userID: "10",
    type: "out",
    timeDateISO: "2025-08-20 17:20:50",
    location: [16.405, 120.599],
    image: "https://picsum.photos/200/120?random=19",
  },
  {
    id: "20",
    userID: "10",
    type: "update",
    timeDateISO: "2025-08-21 09:45:30",
    location: [16.406, 120.6],
    image: "https://picsum.photos/200/120?random=20",
  },

  // User 11 - Iloilo
  {
    id: "21",
    userID: "11",
    type: "in",
    timeDateISO: "2025-08-19 08:25:10",
    location: [10.7202, 122.5621],
    image: "https://picsum.photos/200/120?random=21",
  },
  {
    id: "22",
    userID: "11",
    type: "out",
    timeDateISO: "2025-08-19 17:05:55",
    location: [10.721, 122.563],
    image: "https://picsum.photos/200/120?random=22",
  },
  {
    id: "23",
    userID: "11",
    type: "in",
    timeDateISO: "2025-08-20 08:30:40",
    location: [10.722, 122.564],
    image: "https://picsum.photos/200/120?random=23",
  },
  {
    id: "24",
    userID: "11",
    type: "out",
    timeDateISO: "2025-08-20 16:55:30",
    location: [10.723, 122.565],
    image: "https://picsum.photos/200/120?random=24",
  },
  {
    id: "25",
    userID: "11",
    type: "update",
    timeDateISO: "2025-08-21 11:20:15",
    location: [10.724, 122.566],
    image: "https://picsum.photos/200/120?random=25",
  },

  // User 12 - Clark
  {
    id: "26",
    userID: "12",
    type: "in",
    timeDateISO: "2025-08-19 08:10:30",
    location: [15.185, 120.56],
    image: "https://picsum.photos/200/120?random=26",
  },
  {
    id: "27",
    userID: "12",
    type: "out",
    timeDateISO: "2025-08-19 16:30:45",
    location: [15.186, 120.561],
    image: "https://picsum.photos/200/120?random=27",
  },
  {
    id: "28",
    userID: "12",
    type: "in",
    timeDateISO: "2025-08-20 08:05:25",
    location: [15.187, 120.562],
    image: "https://picsum.photos/200/120?random=28",
  },
  {
    id: "29",
    userID: "12",
    type: "out",
    timeDateISO: "2025-08-20 16:45:35",
    location: [15.188, 120.563],
    image: "https://picsum.photos/200/120?random=29",
  },
  {
    id: "30",
    userID: "12",
    type: "update",
    timeDateISO: "2025-08-21 10:40:00",
    location: [15.189, 120.564],
    image: "https://picsum.photos/200/120?random=30",
  },
]);
