import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatReadableDateTime } from "@saintrelion/time-functions";
import type { Attendance } from "@/models/Attendance";

export default function ViewAttendancePopup({
  record,
  open,
  onOpenChange,
}: {
  record: Attendance;
  open: boolean;
  onOpenChange: (state: boolean) => void;
}) {
  const [address, setAddress] = useState<string | null>(null);

  const lat = record?.location?.[0];
  const lng = record?.location?.[1];

  // Reverse geocode
  useEffect(() => {
    async function fetchAddress() {
      if (!lat || !lng) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        );

        const data = await res.json();

        setAddress(data.display_name);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAddress();
  }, [lat, lng]);

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[95vh] max-h-full w-screen min-w-3xl overflow-hidden bg-black p-0 max-md:min-w-full">
        {/* Optional header / close button */}
        <DialogHeader className="absolute top-4 left-4 z-50">
          <DialogTitle className="text-white">Attendance Record</DialogTitle>
        </DialogHeader>

        {/* Fullscreen image */}
        <div className="relative flex h-full w-full items-center justify-center">
          <img
            src={record.image}
            alt="Attendance snapshot"
            className="h-full w-full bg-black object-contain"
          />

          {/* Bottom overlay info card */}
          <div className="absolute right-0 bottom-0 left-0 m-4 rounded-t-xl bg-white/60 p-4 opacity-80 shadow-lg backdrop-blur-md sm:p-6">
            <div className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-5">
              {/* Small Map */}
              <div className="mb-3 h-28 w-full overflow-hidden rounded-md border sm:mb-0 sm:w-56">
                <MapContainer
                  center={[lat, lng]}
                  zoom={17}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                  dragging={false}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution="© OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]} />
                </MapContainer>
              </div>

              {/* Info Panel */}
              <div className="flex-1 space-y-1 text-sm text-gray-800">
                <div className="text-base font-semibold text-gray-900">
                  {formatReadableDateTime(record.createdAt)}
                </div>
                <div className="line-clamp-2 text-sm text-gray-700">
                  📍 {address ?? "Loading location..."}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {record.type}
                  </span>
                  {record.attribute && (
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        record.attribute === "excused"
                          ? "bg-blue-100 text-blue-700"
                          : record.attribute === "tardy"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.attribute}
                    </span>
                  )}
                  {record.evaluated && (
                    <span className="rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Evaluated
                    </span>
                  )}
                </div>
                <div className="pt-1 text-xs text-gray-500">
                  Lat: {lat} • Lng: {lng}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
