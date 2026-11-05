import { updateAccountProfile } from "@/features/AccountPage/firebase";
import { useAuth, useCurrentUser } from "@/shared/hooks/useAuth";
import { blockDemoAction } from "@/shared/components/demo/demo-actions";
import { useResourceLocked } from "@/shared/lib/useResource";
import type { InternInfo } from "@/shared/model/InternInfo";
import type { User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { useRef, useState } from "react";

// ============================================================
// MARK: Account behavior
export function useAccountPage() {
  const auth = useAuth();
  const user = useCurrentUser<User>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const passwordChangeInFlight = useRef(false);

  const { useList: getIntern } = useResourceLocked<
    InternInfo,
    never,
    InternInfo
  >("interninfo", { showToast: false });

  const internData = getIntern({ filters: { userId: user.id } }).data;
  const intern = internData?.[0] || null;

  const handleUpdate = async (data: Record<string, string>) => {
    if (blockDemoAction()) return;
    await updateAccountProfile(user, intern, data);

    toast.success("Profile Updated");
    auth.refreshUser();
    setIsEditing(false);
  };

  const handleChangePassword = async (data: Record<string, string>) => {
    if (passwordChangeInFlight.current) return;
    passwordChangeInFlight.current = true;
    setIsChangingPassword(true);
    const { currentPassword, newPassword } = data;
    try {
      await auth.changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setPasswordDialogOpen(false);
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "";
      toast.error(
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Current password is incorrect. Your password was not changed."
          : error instanceof Error
            ? error.message
            : "Password update failed.",
      );
    } finally {
      passwordChangeInFlight.current = false;
      setIsChangingPassword(false);
    }
  };
  return {
    user,
    isEditing,
    setIsEditing,
    passwordDialogOpen,
    setPasswordDialogOpen,
    isChangingPassword,
    intern,
    handleUpdate,
    handleChangePassword,
  };
}
