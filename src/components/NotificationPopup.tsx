// import { useState, useRef, useEffect } from "react";
// import { Bell } from "lucide-react";
// import { adminNotifications, adviserLogs } from "@/data/mock-notification";

// import { format, isToday, isYesterday, parseISO } from "date-fns";
// import type { UserRole } from "@/models/userrole";

// interface NotificationPopupProps {
//   role: UserRole;
// }

// export default function NotificationPopup({ role }: NotificationPopupProps) {
//   const grouped = adminNotifications.reduce(
//     (acc, notif) => {
//       const date = parseISO(notif.date);
//       const key = isToday(date)
//         ? "Today"
//         : isYesterday(date)
//           ? "Yesterday"
//           : format(date, "MMMM d");

//       if (!acc[key]) acc[key] = [];
//       acc[key].push(notif);
//       return acc;
//     },
//     {} as Record<string, typeof adminNotifications>,
//   );

//   const [open, setOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement>(null);

//   // Close on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={menuRef}>
//       <Bell
//         size={25}
//         className="cursor-pointer text-gray-700 transition hover:text-blue-600"
//         onClick={() => setOpen((prev) => !prev)}
//       />
//       {open && (
//         <div className="absolute right-0 z-50 mt-2 w-90 rounded-lg border bg-white shadow-lg">
//           <div className="max-h-80 overflow-y-auto rounded-xl p-3 text-sm">
//             {role === "admin" && (
//               <>
//                 {Object.entries(grouped).map(([date, items]) => (
//                   <div key={date} className="mb-3">
//                     <div className="mb-1 text-xs font-semibold text-gray-500">
//                       {date}
//                     </div>
//                     <ul className="space-y-2">
//                       {items.map((notif, idx) => (
//                         <li
//                           key={idx}
//                           className="rounded-md bg-gray-50 px-3 py-2 hover:bg-blue-50"
//                         >
//                           {notif.message}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//                 {adminNotifications.length === 0 && (
//                   <p className="text-center text-gray-500">No notifications</p>
//                 )}
//               </>
//             )}

//             {role === "adviser" && (
//               <div className="space-y-4 text-sm">
//                 {adviserLogs.map((log, idx) => (
//                   <div key={idx} className="grid grid-cols-6 border-b pb-2">
//                     <div className="col-span-4 w-full">
//                       <p>
//                         <strong>{log.name}</strong> {log.type} at {log.time}
//                       </p>
//                     </div>
//                     <img
//                       src={log.image}
//                       alt={`${log.name} selfie`}
//                       className="col-span-2 mt-1 h-20 w-full rounded-md object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}

//             {role === "student" && (
//               <p className="text-center text-gray-500">
//                 No notifications for students
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
