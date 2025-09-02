import { useState, useRef, useEffect } from "react";
import { CircleUser, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <CircleUser
        size={25}
        className="cursor-pointer text-gray-700 transition hover:text-blue-600"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-white shadow-lg">
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <User size={16} /> Profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);

              console.log("Logging out...");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
