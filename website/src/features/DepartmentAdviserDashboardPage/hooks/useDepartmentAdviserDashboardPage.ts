import { useCurrentUser } from "@/shared/hooks/useAuth";
import { useResourceLocked } from "@/shared/lib/useResource";
import type { InternInfo } from "@/shared/model/InternInfo";
import type { User } from "@/shared/model/User";
import { useMemo } from "react";

// ============================================================
// MARK: DepartmentAdviserDashboard behavior
export function useDepartmentAdviserDashboardPage() {
  const user = useCurrentUser<User>();
  const { useList: getUsers } = useResourceLocked<User>("user");
  const { useList: getInternInfos } =
    useResourceLocked<InternInfo>("interninfo");
  const interns = getUsers({
    filters: { role: "intern", department: user.department },
  }).data;
  const internInfos = getInternInfos().data;

  const siteCount = useMemo(() => {
    const ids = new Set(interns.map((intern) => intern.id));
    return new Set(
      internInfos
        .filter((info) => ids.has(info.userId) && info.trainingCompany)
        .map((info) => info.trainingCompany),
    ).size;
  }, [interns, internInfos]);
  return { user, interns, siteCount };
}
