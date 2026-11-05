import { AuthContext } from "@/shared/auth/context";
import type { NewUser } from "@/shared/model/auth";
import { demoPersonaKey, isDemo } from "@/shared/config/demo";
import { app, auth, db } from "@/shared/lib/firebase-client";
import type { User } from "@/shared/model/User";
import { useQueryClient } from "@tanstack/react-query";
import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  reauthenticateWithCredential,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState, type ReactNode } from "react";

async function loadProfile(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, "ojt_User", uid));
  if (!snapshot.exists()) return null;
  const profile = { ...snapshot.data(), id: uid } as User;
  return ["admin", "departmentadviser", "intern"].includes(profile.roles?.[0])
    ? profile
    : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const previousUid = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (identity) => {
      if (previousUid.current !== (identity?.uid ?? null)) {
        queryClient.clear();
        previousUid.current = identity?.uid ?? null;
      }
      setAuthUid(identity?.uid ?? null);
      try {
        const profileId = isDemo
          ? sessionStorage.getItem(demoPersonaKey)
          : identity?.uid;
        setUser(identity && profileId ? await loadProfile(profileId) : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, [queryClient]);

  async function refreshUser() {
    const id = isDemo
      ? sessionStorage.getItem(demoPersonaKey)
      : auth.currentUser?.uid;
    setUser(auth.currentUser && id ? await loadProfile(id) : null);
  }

  async function selectPersona(id: string) {
    if (!isDemo) throw new Error("Open the demo first.");
    setIsLocked(true);
    try {
      if (!auth.currentUser?.isAnonymous) {
        await signOut(auth);
        await signInAnonymously(auth);
      }
      const profile = await loadProfile(id);
      if (!profile || !profile.isEnabled)
        throw new Error(
          "This demo account is unavailable. Please select another account.",
        );
      sessionStorage.setItem(demoPersonaKey, id);
      queryClient.clear();
      setAuthUid(auth.currentUser!.uid);
      setUser(profile);
    } finally {
      setIsLocked(false);
    }
  }

  async function login(email: string, password: string) {
    if (isDemo) throw new Error("Select a demo account below.");
    setIsLocked(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const profile = await loadProfile(credential.user.uid);
      if (!profile || profile.isEnabled === false) {
        await signOut(auth);
        throw new Error("This account has no active Fieldwork profile.");
      }
      setUser(profile);
    } finally {
      setIsLocked(false);
    }
  }

  async function logout() {
    sessionStorage.removeItem(demoPersonaKey);
    await signOut(auth);
    setUser(null);
  }

  async function register(info: NewUser, password: string) {
    if (isDemo) throw new Error("Demo only: no account was created.");
    const currentRole = user?.roles?.[0];
    if (
      currentRole !== "admin" &&
      !(
        currentRole === "departmentadviser" &&
        info.role === "intern" &&
        info.department === user?.department
      )
    ) {
      throw new Error(
        "You can only register accounts for your permitted role and department.",
      );
    }
    const secondaryApp = initializeApp(
      app.options,
      `provision-${crypto.randomUUID()}`,
    );
    const secondaryAuth = getAuth(secondaryApp);
    setIsLocked(true);
    try {
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        info.email.trim(),
        password,
      );
      try {
        await setDoc(doc(db, "ojt_User", credential.user.uid), {
          id: credential.user.uid,
          firstName: info.firstName.trim(),
          lastName: info.lastName.trim(),
          username: info.username.trim(),
          email: info.email.trim(),
          department: info.department,
          role: info.role,
          roles: [info.role],
          isEnabled: true,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        await deleteUser(credential.user);
        throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      return credential.user.uid;
    } finally {
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
      setIsLocked(false);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (isDemo) throw new Error("Passwords cannot be changed in the demo.");
    const identity = auth.currentUser;
    if (!identity?.email)
      throw new Error("Sign in again to change your password.");
    await reauthenticateWithCredential(
      identity,
      EmailAuthProvider.credential(identity.email, currentPassword),
    );
    await updatePassword(identity, newPassword);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authUid,
        selectPersona,
        loading,
        isLocked,
        login,
        logout,
        refreshUser,
        register,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
