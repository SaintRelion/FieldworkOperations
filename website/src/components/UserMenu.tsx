import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";

export default function UserMenu() {
  const auth = useAuth();

  return (
    <button
      type="button"
      aria-label="Sign out"
      onClick={async () => {
        await auth.logout();
      }}
      className="grid h-10 w-10 place-items-center border border-white/20 text-slate-300 transition-colors hover:border-white/50 hover:text-white"
    >
      <LogOut size={17} aria-hidden="true" />
    </button>
  );
}
