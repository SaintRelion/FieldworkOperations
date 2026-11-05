import { useCurrentUser } from "@/shared/hooks/useAuth";
import { useResourceLocked } from "@/shared/lib/useResource";
import type {
  Accomplishment,
  CreateAccomplishment,
} from "@/shared/model/Accomplishment";
import type { User } from "@/shared/model/User";
import { toast } from "@saintrelion/notifications";
import { useMemo, useState } from "react";

// ============================================================
// MARK: Accomplishments behavior
export function useAccomplishmentsPage() {
  const user = useCurrentUser<User>();

  const { useList: getAccomplishments, useInsert: insertAccomplishment } =
    useResourceLocked<Accomplishment, CreateAccomplishment>("accomplishment", {
      showToast: false,
    });

  const accomplishments = getAccomplishments({
    filters: { userId: user.id },
  }).data;

  const [showModal, setShowModal] = useState(false);

  // ============================================================
  // MARK: Group accomplishments by date
  const sortedGrouped = useMemo<[string, Accomplishment[]][]>(() => {
    const map: Record<string, Accomplishment[]> = {};
    [...accomplishments]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .forEach((item) => {
        if (!map[item.date]) map[item.date] = [];
        map[item.date].push(item);
      });
    return Object.entries(map);
  }, [accomplishments]);

  const handleInsert = async (payload: CreateAccomplishment) => {
    try {
      await insertAccomplishment.run(payload);
      toast.success("Accomplishment logged!");
      setShowModal(false);
    } catch {
      toast.error("Entry could not be saved. Please try again.");
    }
  };
  return {
    user,
    insertAccomplishment,
    accomplishments,
    showModal,
    setShowModal,
    sortedGrouped,
    handleInsert,
  };
}
