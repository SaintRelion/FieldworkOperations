import type { Coords } from "./geo-models";

export interface UseGeoOptions {
  mode?: "single" | "track";
  autoStopAfterMs?: number; // if track mode, auto-stop after this time
  highAccuracy?: boolean;
  minDistance?: number; // ignore jitter below X meters
  externalCoords?: Coords | null;
  externalPath?: Coords[];
  onStop?: () => void;
}
