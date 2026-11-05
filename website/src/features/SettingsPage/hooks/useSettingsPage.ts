import { useCurrentUser } from "@/shared/hooks/useAuth";
import { blockDemoAction } from "@/shared/components/demo/demo-actions";
import { useResourceLocked } from "@/shared/lib/useResource";
import type { CreateSettings, Settings } from "@/shared/model/Settings";
import type { User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { useEffect, useState } from "react";

// ============================================================
// MARK: Settings behavior
export function useSettingsPage() {
  const user = useCurrentUser<User>();
  const [draft, setDraft] = useState<CreateSettings>(() => ({
    department: user?.department ?? "",
    timeIn: "08:00",
    timeOut: "17:00",
    gracePeriodMinutes: 15,
  }));
  const {
    useList: getSettings,
    useInsert: insertSettings,
    useUpdate: updateSettings,
  } = useResourceLocked<Settings, CreateSettings, CreateSettings>("settings", {
    showToast: false,
  });
  const settingsData = getSettings({
    filters: { department: user.department },
  }).data;
  const existingSettings = settingsData?.[0];

  useEffect(() => {
    if (existingSettings) {
      setDraft({
        department: existingSettings.department,
        timeIn: existingSettings.timeIn,
        timeOut: existingSettings.timeOut,
        gracePeriodMinutes: existingSettings.gracePeriodMinutes,
      });
    }
  }, [existingSettings]);

  const handleSave = async () => {
    if (blockDemoAction()) return;
    if (!existingSettings) {
      await insertSettings.run(draft);
    } else {
      await updateSettings.run({ id: existingSettings.id, payload: draft });
    }
    toast.success("Settings modified");
  };
  return { user, draft, setDraft, handleSave };
}
