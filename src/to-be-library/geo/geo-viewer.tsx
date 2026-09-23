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

export function GeoViewer({
  onCoordinateChange,
  geoOptions,
}: {
  onCoordinateChange: (coords: Coords, path: Coords[]) => void;
  geoOptions?: UseGeoOptions;
}) {
  const { coords, path, getLocation } = useGeo(geoOptions);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Communicates updates to parent state without causing render loops
  useEffect(() => {
    if (onCoordinateChange && coords) {
      onCoordinateChange(coords, path);
    }
  }, [coords, path, onCoordinateChange]);

  const myIcon = L.icon({
    iconUrl: "/my-marker.png",
    iconSize: [48, 41],
    iconAnchor: [24, 38],
  });

  function Recenter({ coords }: { coords: Coords }) {
    const map = useMap();
    useEffect(() => {
      if (coords?.lat) {
        map.setView([coords.lat, coords.lng], map.getZoom());
        map.invalidateSize();
      }
    }, [coords, map]);
    return null;
  }

  const centerPos = coords?.lat
    ? coords
    : (geoOptions?.externalCoords ?? { lat: 8.59, lng: 123.34 });

  return (
    <MapContainer
      center={centerPos}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full"
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
  );
}
