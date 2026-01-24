import { LogOut } from "lucide-react";
import { useAuth } from "@saintrelion/auth-lib";

export default function UserMenu() {
  const auth = useAuth();

  return (
    <LogOut
      size={16}
      onClick={async () => {
        await auth.logout();
      }}
      className="cursor-pointer"
    />
  );
}
