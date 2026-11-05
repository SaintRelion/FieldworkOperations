import { useAuth } from "@/shared/hooks/useAuth";
import { DemoNotice } from "@/shared/components/demo/DemoNotice";
import { auth, db } from "@/shared/lib/firebase-client";
import { Department } from "@/shared/model/department";
import type { User } from "@/shared/model/User";
import { signInAnonymously } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
export function DemoPicker({ onSelected }: { onSelected?: () => void }) {
  const { selectPersona, isLocked } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [role, setRole] = useState("intern");
  const [department, setDepartment] = useState("BSIT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setError("");
      setLoading(true);
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
        const result = await getDocs(collection(db, "ojt_User"));
        if (active)
          setProfiles(
            result.docs.map(
              (snapshot) => ({ ...snapshot.data(), id: snapshot.id }) as User,
            ),
          );
      } catch {
        if (active)
          setError("Could not load the demo accounts. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [attempt]);
  const choices = profiles.filter(
    (profile) =>
      profile.isEnabled &&
      profile.role === role &&
      (role === "admin" || profile.department === department),
  );
  return (
    <section className="space-y-4">
      <DemoNotice>
        All accounts and records are samples. Use sample information only.
      </DemoNotice>
      <h2 className="text-xl font-semibold">Select an account</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Choose a role and department, then select an account.
      </p>
      <label className="mt-5 block text-sm font-semibold" htmlFor="demo-role">
        Role
      </label>
      <select
        id="demo-role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3"
      >
        <option value="intern">Intern</option>
        <option value="departmentadviser">Department adviser</option>
        <option value="admin">Administrator</option>
      </select>
      {role !== "admin" && (
        <>
          <label
            className="mt-4 block text-sm font-semibold"
            htmlFor="demo-department"
          >
            Department
          </label>
          <select
            id="demo-department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3"
          >
            {Object.entries(Department).map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </>
      )}
      {loading && (
        <p role="status" className="mt-4 text-sm">
          Loading accounts…
        </p>
      )}
      {error && (
        <div className="mt-4 text-sm text-red-700" role="alert">
          {error}
          <button
            className="ml-2 min-h-11 underline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      )}
      <div className="mt-5 grid gap-2">
        {choices.map((profile) => (
          <button
            key={profile.id}
            disabled={isLocked}
            onClick={async () => {
              try {
                await selectPersona(profile.id);
                onSelected?.();
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : "Unable to open demo.",
                );
              }
            }}
            className="min-h-14 border border-slate-300 bg-white px-4 py-3 text-left hover:border-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            <span className="block font-semibold">
              {profile.firstName} {profile.lastName}
            </span>
            <span className="text-xs text-slate-500">
              {isLocked ? "Signing in…" : profile.department}
            </span>
          </button>
        ))}
      </div>
      {!loading && !error && !choices.length && (
        <p className="mt-4 text-sm" role="status">
          No demo accounts are available for this department.
        </p>
      )}
    </section>
  );
}
