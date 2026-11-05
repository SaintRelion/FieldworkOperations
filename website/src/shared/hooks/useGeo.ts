import type { Coords } from "@/shared/model/geo";
import type { UseGeoOptions } from "@/shared/model/use-geo";
import { useCallback, useEffect, useRef, useState } from "react";

export function useGeo(options: UseGeoOptions = {}) {
  const { highAccuracy = true, externalCoords } = options;

  const [coords, setCoords] = useState<Coords | null>(null);
  const [path, setPath] = useState<Coords[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const watchRef = useRef<number | null>(null);

  console.log(coords);

  useEffect(() => {
    if (externalCoords) {
      // Only update if the values are actually different to prevent unnecessary cycles
      setCoords((prev) => {
        if (
          prev?.lat === externalCoords.lat &&
          prev?.lng === externalCoords.lng
        ) {
          return prev;
        }
        return externalCoords;
      });
    }
  }, [externalCoords]);

  const stopTracking = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      setIsTracking(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    if (isTracking) return;

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCoords(newPoint);
        setPath((prev) => [...prev, newPoint]);
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: highAccuracy, maximumAge: 1000 },
    );

    watchRef.current = id;
  }, [highAccuracy, isTracking]);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { coords, path, isTracking, getLocation, stopTracking };
}
