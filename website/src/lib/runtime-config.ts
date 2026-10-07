const keys = [
  "VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID", "VITE_FIREBASE_MEASUREMENT_ID",
] as const;

// Only local Vite development reads .env. Container builds use config.json.
export const runtimeConfig: Record<string, string> = Object.fromEntries(
  keys.map(key => [key, import.meta.env.DEV ? String(import.meta.env[key] ?? "") : ""]),
);

export async function loadRuntimeConfig() {
  if (import.meta.env.DEV) return;
  const response = await fetch("/config.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Cannot load website configuration");
  const values: unknown = await response.json();
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    throw new Error("Invalid website configuration");
  }
  const config = values as Record<string, unknown>;
  for (const key of keys) {
    const value = config[key] ?? "";
    if (typeof value !== "string") throw new Error(`Invalid configuration: ${key}`);
    runtimeConfig[key] = value;
  }
  for (const key of ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID", "VITE_FIREBASE_APP_ID"]) {
    if (!runtimeConfig[key]) throw new Error(`Missing configuration: ${key}`);
  }
}
