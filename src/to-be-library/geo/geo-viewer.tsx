import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { Coords } from "./geo-models";
import { useGeo } from "./use-geo";
import type { UseGeoOptions } from "./use-geo-model";
import { MapPin } from "lucide-react";

export function GeoViewer({
  wrapperClass = "h-full w-full rounded",
  showMap = true,
  showControls = true,
  enableLogs = false,
  onCoordinateChange,
  geoOptions,
}: {
  wrapperClass?: string;
  showMap?: boolean;
  showControls?: boolean;
  enableLogs?: boolean;
  onCoordinateChange: (coords: Coords, path: Coords[]) => void;
  geoOptions?: UseGeoOptions;
}) {
  const {
    coords,
    path,
    travelledDistance,
    isTracking,
    getLocation,
    stopTracking,
    reset,
  } = useGeo(geoOptions);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  if (onCoordinateChange)
    onCoordinateChange(coords ?? { lat: 0, lng: 0 }, path);

  const myIcon = L.icon({
    iconUrl: "/my-marker.png",
    iconSize: [48, 41],
    iconAnchor: [24, 38],
  });

  function Recenter({ coords }: { coords: Coords }) {
    const map = useMap();
    useEffect(() => {
      if (coords) map.setView([coords.lat, coords.lng], map.getZoom());
    }, [coords, map]);
    return null;
  }

  return (
    <div
      className={`relative flex flex-col items-center space-y-4 p-4 ${wrapperClass}`}
    >
      {showMap && (
        <MapContainer
          center={coords || { lat: 0, lng: 0 }}
          zoom={16}
          scrollWheelZoom
          className="h-64 w-full rounded"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {coords && <Marker position={coords} icon={myIcon} />}
          {path?.length > 1 ? (
            <Polyline positions={path} color="blue" />
          ) : (
            path?.length == 1 && (
              <Polyline positions={[path[0], path[0]]} color="blue" />
            )
          )}
          {coords && <Recenter coords={coords} />}
        </MapContainer>
      )}

      {showControls && (
        <div className="bg-opacity-90 w-full rounded bg-white p-4 shadow-md">
          {coords ? (
            <p className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span>
                Lat: {coords.lat}, Lng: {coords.lng}
              </span>
            </p>
          ) : (
            <p>No GPS data yet</p>
          )}
          {path.length > 0 && (
            <p>Total Distance: {(travelledDistance / 1000).toFixed(3)} km</p>
          )}
          <div className="mt-2 flex space-x-2">
            <button
              onClick={getLocation}
              disabled={isTracking}
              className="rounded bg-green-600 px-3 py-1 text-white"
            >
              Start
            </button>
            <button
              onClick={stopTracking}
              disabled={!isTracking}
              className="rounded bg-red-600 px-3 py-1 text-white"
            >
              Stop
            </button>
            <button
              onClick={reset}
              className="rounded bg-gray-600 px-3 py-1 text-white"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {enableLogs && (
        <div className="w-full rounded bg-gray-100 p-2 font-mono text-xs whitespace-pre-wrap">
          {path.length > 0 ? (
            <div>
              <p className="mb-1 font-semibold">📍 Path Logs:</p>
              {path.map((p, i) => (
                <p key={i}>
                  {i + 1}. Lat: {p.lat.toFixed(6)}, Lng: {p.lng.toFixed(6)}
                </p>
              ))}
            </div>
          ) : coords ? (
            <div>
              <p className="mb-1 font-semibold">📍 Current Location:</p>
              <p>
                Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <p>No GPS data yet</p>
          )}
        </div>
      )}
    </div>
  );
}
