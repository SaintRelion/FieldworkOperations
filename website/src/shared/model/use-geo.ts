import type { Coords } from "@/shared/model/geo";

export interface UseGeoOptions {
  mode?: "single" | "track";
  autoStopAfterMs?: number; // if track mode, auto-stop after this time
  highAccuracy?: boolean;
  minDistance?: number; // ignore jitter below X meters
  externalCoords?: Coords | null;
  externalPath?: Coords[];
  onStop?: () => void;
}
