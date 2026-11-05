import { useAuth } from "@/shared/hooks/useAuth";
import { toast } from "@saintrelion/notifications";

// ============================================================
// MARK: Login behavior
export function useLoginPage() {
  const auth = useAuth();

  const handleLogin = async (data: Record<string, string>) => {
    try {
      await auth.login(data.email, data.password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed.");
    }
  };
  return { auth, handleLogin };
}
