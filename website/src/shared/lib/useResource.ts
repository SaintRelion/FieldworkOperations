import { demoPersonaKey, demoPhoto, isDemo } from "@/shared/config/demo";
import { auth, db } from "@/shared/lib/firebase-client";
import { useResourceLocked as useLiveResource } from "@saintrelion/data-access-layer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";

type Params = Parameters<ReturnType<typeof useLiveResource>["useList"]>[0];
type Row = Record<string, unknown> & { id: string };
const stores: Record<string, string> = {
  user: "User",
  attendance: "Attendance",
  accomplishment: "Accomplishments",
  interninfo: "InternInfo",
  settings: "Settings",
  notification: "Notification",
  ojtyearlydaterange: "OjtYearlyDateRange",
};
const writable = new Set(["attendance", "accomplishment", "interninfo"]);

function useDemoResource<Read, Create, Update>(name: string) {
  const client = useQueryClient();
  const [isLocked, setLocked] = useState(false);
  const inFlight = useRef(false);
  const store = `ojt_${stores[name]}`;
  const uid = auth.currentUser?.uid;
  const key = ["demo", uid, name, sessionStorage.getItem(demoPersonaKey)];
  async function rows(): Promise<Row[]> {
    if (!uid) throw new Error("Sign into the demo first.");
    const [seed, additions] = await Promise.all([
      getDocs(collection(db, store)),
      getDocs(collection(db, "demoSessions", uid, store)),
    ]);
    const records = new Map<string, Row>();
    for (const snapshot of [...seed.docs, ...additions.docs])
      records.set(snapshot.id, { ...snapshot.data(), id: snapshot.id });
    return [...records.values()];
  }
  async function mutate(
    payload: Record<string, unknown>,
    id: string = crypto.randomUUID(),
  ): Promise<string> {
    if (!uid || !writable.has(name))
      throw new Error("This action is unavailable in the demo.");
    if (inFlight.current) throw new Error("An update is already in progress.");
    inFlight.current = true;
    setLocked(true);
    try {
      const existing = (await rows()).find((row) => row.id === id);
      const record = {
        ...existing,
        ...payload,
        id,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerUid: uid,
      };
      if (name === "attendance" || name === "accomplishment")
        Object.assign(record, { image: demoPhoto });
      await setDoc(doc(db, "demoSessions", uid, store, id), record);
      await client.invalidateQueries({ queryKey: key });
      return id;
    } finally {
      inFlight.current = false;
      setLocked(false);
    }
  }
  function useList(params?: Params) {
    return useQuery({
      queryKey: [...key, params],
      initialData: [] as Read[],
      enabled: params?.enabled !== false && !!uid,
      queryFn: async () =>
        (await rows()).filter((row) =>
          Object.entries(params?.filters ?? {}).every(([field, value]) => {
            if (value && typeof value === "object") {
              if (value.in) return value.in.includes(row[field] as string);
              if (value.gte !== undefined)
                return Number(row[field]) >= value.gte;
              if (value.lte !== undefined)
                return Number(row[field]) <= value.lte;
            }
            return row[field] === value;
          }),
        ) as Read[],
    });
  }
  function useRetrieve(id: string) {
    return useQuery({
      queryKey: [...key, id],
      enabled: !!uid,
      queryFn: async () => {
        const row = (await rows()).find((row) => row.id === id);
        if (!row) throw new Error("Record unavailable.");
        return row as Read;
      },
    });
  }
  return {
    useList,
    useRetrieve,
    useInsert: {
      isLocked,
      run: (payload: Create) => mutate(payload as Record<string, unknown>),
    },
    useUpdate: {
      isLocked,
      run: ({ id, payload }: { id: string; payload: Partial<Update> }) =>
        mutate(payload as Record<string, unknown>, id),
    },
    useDelete: {
      isLocked,
      run: async (): Promise<boolean> => {
        throw new Error("Deleting seeded records is unavailable in the demo.");
      },
    },
  };
}

// The workspace is selected before Firebase initializes and remains fixed until reload.
export const useResourceLocked: typeof useLiveResource = isDemo
  ? useDemoResource
  : useLiveResource;
