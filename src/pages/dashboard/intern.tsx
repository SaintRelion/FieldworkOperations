import { useEffect, useRef, useState } from "react";
import { Camera, Clock, MapPin, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseYYYYMMDD } from "@/lib/mydate";
import type { AttendanceLog } from "@/models/attendance";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useDBOperations, useMockSelect } from "@saintrelion/data-access-layer";
import { useAuth } from "@saintrelion/auth-lib";

export default function InternDashboardPage() {
  const { user } = useAuth();

  const [timedIn, setTimedIn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [location, setLocation] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { useInsert } = useDBOperations<AttendanceLog>({
    model: "AttendanceLogs",
    mode: "mock",
  });

  const { data: attendanceLogs = [] } = useMockSelect<AttendanceLog>(
    "AttendanceLogs",
    {
      filterFn: (log) => log.userID === user.id,
      sortFn: (a, b) =>
        new Date(b.timeDateISO).getTime() - new Date(a.timeDateISO).getTime(),
    },
  );

  const [captureLoading, setCaptureLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation([latitude, longitude]);
        },
        () => setLocation([]),
      );
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => console.error("Camera access denied"));
    }
  }, []);

  // 📸 Capture photo
  const handleCapture = () => {
    if (captureLoading) return;
    setCaptureLoading(true);

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 300, 200);
        const img = canvasRef.current.toDataURL("image/png");
        setCapturedImage(img);
        setTimedIn(true);

        useInsert.mutate({
          userID: user.id,
          type: "in",
          timeDateISO: currentTime,
          location: location,
          image: img,
        });
      }
    }

    setTimeout(() => {
      setCapturedImage(null);
      setCaptureLoading(false);

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => console.error("Camera access denied"));
    }, 2000); // ⏳ 2s delay
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Side: Live Camera + Controls */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Attendance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Live Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <p className="text-muted-foreground text-sm">Current Time</p>
            </div>
            <p className="text-3xl font-bold">{parseYYYYMMDD(currentTime)}</p>
          </div>

          {/* Camera */}
          {!capturedImage && (
            <video
              ref={videoRef}
              autoPlay
              className="w-full rounded-xl border shadow"
            />
          )}
          <canvas ref={canvasRef} width="300" height="200" className="hidden" />

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-xl border shadow"
            />
          )}

          {/* Info */}
          <div className="text-md space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span>
                {location[0]}, {location[1]}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-2">
            {!timedIn ? (
              <Button
                onClick={handleCapture}
                disabled={captureLoading}
                className="px-6"
              >
                <Camera className="mr-2 h-4 w-4" />
                {captureLoading ? "Saving..." : "Time In"}
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                <Button
                  variant="secondary"
                  onClick={handleCapture}
                  disabled={captureLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {captureLoading ? "Saving..." : "Periodic Update"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCapture();
                    setTimedIn(false);
                  }}
                >
                  Time Out
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Side: Attendance Logs */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] space-y-3 overflow-y-auto">
          {attendanceLogs.length === 0 && (
            <p className="text-muted-foreground text-center text-sm">
              No attendance logs yet.
            </p>
          )}

          {attendanceLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border p-2 shadow-sm"
            >
              <img
                src={log.image}
                alt="log"
                className="h-16 w-20 rounded-md border object-cover"
              />
              <div className="flex flex-col text-sm">
                <span className="font-medium">
                  {parseYYYYMMDD(log.timeDateISO)}
                </span>
                <span className="text-muted-foreground">{log.location}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function MapView({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={19}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          Lat: {lat}, Lng: {lng}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
