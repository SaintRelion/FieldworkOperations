import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { app, auth, db } from "@/lib/firebase-client";
import type { User } from "@/models/User";

type NewUser = Pick<User, "firstName" | "lastName" | "username" | "email" | "department"> & {
  role: "intern" | "departmentadviser";
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isLocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (info: NewUser, password: string) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, "ojt_User", uid));
  if (!snapshot.exists()) return null;
  const profile = { ...snapshot.data(), id: uid } as User;
  return ["admin", "departmentadviser", "intern"].includes(profile.roles?.[0]) ? profile : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const previousUid = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (identity) => {
      if (previousUid.current !== (identity?.uid ?? null)) {
        queryClient.clear();
        previousUid.current = identity?.uid ?? null;
      }
      try {
        setUser(identity ? await loadProfile(identity.uid) : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, [queryClient]);

  async function refreshUser() {
    setUser(auth.currentUser ? await loadProfile(auth.currentUser.uid) : null);
  }

  async function login(email: string, password: string) {
    setIsLocked(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
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
    await signOut(auth);
    setUser(null);
  }

  async function register(info: NewUser, password: string) {
    const currentRole = user?.roles?.[0];
    if (currentRole !== "admin" && !(currentRole === "departmentadviser" && info.role === "intern" && info.department === user?.department)) {
      throw new Error("You can only register accounts for your permitted role and department.");
    }
    const secondaryApp = initializeApp(app.options, `provision-${crypto.randomUUID()}`);
    const secondaryAuth = getAuth(secondaryApp);
    setIsLocked(true);
    try {
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const credential = await createUserWithEmailAndPassword(secondaryAuth, info.email.trim(), password);
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
    const identity = auth.currentUser;
    if (!identity?.email) throw new Error("Sign in again to change your password.");
    await reauthenticateWithCredential(identity, EmailAuthProvider.credential(identity.email, currentPassword));
    await updatePassword(identity, newPassword);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isLocked, login, logout, refreshUser, register, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is missing.");
  return context;
}

export function useCurrentUser<T extends User = User>(): T {
  const { user } = useAuth();
  if (!user) throw new Error("A signed-in user is required.");
  return user as T;
}
