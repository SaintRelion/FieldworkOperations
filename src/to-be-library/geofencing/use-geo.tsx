import { useState, useRef, useEffect, useCallback } from "react";
import { getDistance } from "geolib";
import type { Coords } from "./geo-models";
import type { UseGeoOptions } from "./use-geo-model";

export function useGeo(options: UseGeoOptions = {}) {
  const {
    mode = "single",
    autoStopAfterMs,
    highAccuracy = true,
    minDistance = 1,
    externalCoords,
    externalPath,
    onStop,
  } = options;

  const [coords, setCoords] = useState<Coords | null>(null);
  const [path, setPath] = useState<Coords[]>([]);
  const [travelledDistance, setTravelledDistance] = useState<number>(() => {
    if (externalPath && externalPath.length > 1) {
      return externalPath.reduce((acc, point, i) => {
        if (i === 0) return 0;
        return acc + getDistance(externalPath[i - 1], point);
      }, 0);
    }
    return 0;
  });
  const [isTracking, setIsTracking] = useState(false);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (externalPath && externalPath.length > 1) {
      const d = externalPath.reduce((acc, point, i) => {
        if (i === 0) return 0;
        return acc + getDistance(externalPath[i - 1], point);
      }, 0);
      setTravelledDistance(d);
      setPath(externalPath);
    }
  }, [externalPath]);

  useEffect(() => {
    if (externalCoords) setCoords(externalCoords);
  }, [externalCoords]);

  const stopTracking = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      setIsTracking(false);
      onStop?.();
    }
  }, [onStop]);

  const getLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      throw new Error("Geolocation not supported");
    }

    // In view mode, don’t do anything
    if (externalCoords || externalPath) {
      console.log(
        "Used for calculation only, manually using geolocation on client",
      );

      return;
    }

    // Single snapshot mode
    if (mode === "single") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(p);
        },
        console.error,
        { enableHighAccuracy: highAccuracy },
      );
      return;
    }

    // Continuous tracking
    if (isTracking) return;
    setIsTracking(true);

    console.log("Start");
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(newPoint);
        setPath((prev) => {
          // If no previous points yet
          if (prev.length === 0) return [newPoint];

          const last = prev[prev.length - 1];
          const d = getDistance(last, newPoint);

          // Only add if distance is significant
          if (d > minDistance) {
            setTravelledDistance((x) => x + d);
            return [...prev, newPoint];
          }

          // Otherwise, keep existing path
          return prev;
        });
      },
      console.error,
      { enableHighAccuracy: true, maximumAge: 1000 },
    );

    watchRef.current = id;
    if (autoStopAfterMs) {
      setTimeout(() => stopTracking(), autoStopAfterMs);
    }
  }, [
    mode,
    externalCoords,
    externalPath,
    highAccuracy,
    minDistance,
    autoStopAfterMs,
    stopTracking,
    isTracking,
  ]);

  const reset = useCallback(() => {
    setCoords(null);
    setPath([]);
    setTravelledDistance(0);
    stopTracking();
  }, [stopTracking]);

  useEffect(() => {
    return stopTracking;
  }, [stopTracking]);

  return {
    coords,
    path,
    travelledDistance,
    isTracking,
    getLocation,
    stopTracking,
    reset,
  };
}
