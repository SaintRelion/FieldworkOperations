import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatReadableDateTime } from "@saintrelion/time-functions";
import type { Attendance } from "@/models/Attendance";
import { MapPin, Calendar, ShieldCheck, ImageOff, X } from "lucide-react";

interface ViewAttendancePopupProps {
  record: Attendance;
  open: boolean;
  onOpenChange: (state: boolean) => void;
}

export default function ViewAttendancePopup({
  record,
  open,
  onOpenChange,
}: ViewAttendancePopupProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);

  const lat = record?.location?.[0];
  const lng = record?.location?.[1];

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
        console.error("Geocoding error:", err);
      }
    }
    if (open) {
      fetchAddress();
      setImgError(false); // Reset error state when opening new record
    }
  }, [lat, lng, open]);

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden rounded-[2.5rem] border-none bg-slate-900 p-0 shadow-2xl">
        {/* Header Overlay */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-[0.3em] text-white/50 uppercase">
              Verified Record
            </h2>
            <p className="text-sm font-bold text-white">
              {record.type.replace("-", " ").toUpperCase()}
            </p>
          </div>
        </div>

        {/* Close Button Override */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all hover:bg-white/20"
        >
          <X size={20} />
        </button>

        <div className="relative flex min-h-[70vh] w-full flex-col md:flex-row">
          {/* LEFT: IMAGE VIEWPORT */}
          <div className="relative flex flex-[1.5] items-center justify-center overflow-hidden border-r border-white/5 bg-black">
            {!imgError ? (
              <img
                src={record.image}
                alt="Attendance snapshot"
                onError={() => setImgError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <ImageOff size={48} strokeWidth={1} />
                <p className="text-xs font-bold tracking-widest uppercase">
                  Snapshot not found
                </p>
              </div>
            )}

            {/* Timestamp Overlay */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
              <Calendar size={12} className="text-emerald-400" />
              <span className="text-[10px] font-black tracking-widest text-white uppercase">
                {formatReadableDateTime(record.createdAt)}
              </span>
            </div>
          </div>

          {/* RIGHT: DATA PANEL */}
          <div className="flex flex-1 flex-col bg-[#F8FAFC] p-8">
            <h3 className="mb-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
              Technical Audit
            </h3>

            <div className="flex-1 space-y-6">
              {/* MINI MAP SECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin size={16} className="text-emerald-500" />
                  <span className="text-xs font-black tracking-widest uppercase">
                    GPS Localization
                  </span>
                </div>
                <div className="h-48 w-full overflow-hidden rounded-3xl border-4 border-white shadow-xl shadow-slate-200/50">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={16}
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                    scrollWheelZoom={false}
                    dragging={true}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[lat, lng]} />
                  </MapContainer>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
                    Resolved Address
                  </p>
                  <p className="text-xs leading-relaxed font-bold text-slate-600">
                    {address ?? "Resolving coordinate data..."}
                  </p>
                </div>
              </div>

              {/* METADATA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <p className="mb-1 text-[9px] font-black text-slate-300 uppercase">
                    Latitude
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-700">
                    {lat.toFixed(6)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <p className="mb-1 text-[9px] font-black text-slate-300 uppercase">
                    Longitude
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-700">
                    {lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* EVALUATION STATUS */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Audit Status
                  </span>
                  <div className="flex gap-2">
                    {record.evaluated ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase">
                        Cleared
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700 uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
