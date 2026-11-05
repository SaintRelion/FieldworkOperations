import { db } from "@/shared/lib/firebase-client";
import type { InternInfo } from "@/shared/model/InternInfo";
import type { User } from "@/shared/model/User";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

export async function updateAccountProfile(
  user: User,
  intern: InternInfo | null,
  data: Record<string, string>,
) {
  const { trainingCompany, firstName, lastName } = data;

  // ============================================================
  // MARK: User profile update
  await updateDoc(doc(db, "ojt_User", user.id), {
    firstName,
    lastName,
    updatedAt: serverTimestamp(),
  });

  // ============================================================
  // MARK: Intern placement update
  if (user.roles?.[0] === "intern" && intern) {
    await updateDoc(doc(db, "ojt_InternInfo", intern.id), {
      trainingCompany,
      updatedAt: serverTimestamp(),
    });
  }
}
