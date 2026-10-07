import { useEffect, useRef, useState, type ReactNode } from "react";

interface CameraCaptureProps {
  /** Custom UI (buttons, etc.) rendered below the camera feed */
  children?: (controls: {
    capture: () => string | null;
    isCapturing: boolean;
    isReady: boolean;
    error: string | null;
    reset: () => void;
  }) => ReactNode;
  autoStart?: boolean;
  resetDelay?: number;
  /** Dimensions of the capture area */
  width?: number;
  height?: number;
}

export function CameraCapture({
  children,
  autoStart = true,
  resetDelay = 4000,
  width,
  height,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setIsReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setError("Camera access is required to record attendance.");
      setIsReady(false);
    }
  };

  /** Stop the camera stream */
  const stopCamera = () => {
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setIsReady(false);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (isCapturing || !isReady || !video || !canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("The camera image could not be captured. Please try again.");
      return null;
    }

    const w = width ?? video.videoWidth;
    const h = height ?? video.videoHeight;
    if (!w || !h) {
      setError("The camera is still starting. Please wait a moment.");
      return null;
    }

    setIsCapturing(true);

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(video, 0, 0, w, h);
    const img = canvas.toDataURL("image/jpeg", 0.86);
    setCapturedImage(img);

    setTimeout(() => {
      setIsCapturing(false);
      reset();
    }, resetDelay ?? 2000);

    return img;
  };

  const reset = () => {
    setCapturedImage(null);
  };

  useEffect(() => {
    if (autoStart) startCamera();
    return stopCamera;
  }, [autoStart]);

  return (
    <div className="flex w-full flex-col items-center space-y-2">
      <div className="relative w-full overflow-hidden border border-[#152238]/15 bg-[#09111f] shadow-sm">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={() => setIsReady(true)}
          className="block aspect-video max-h-[420px] w-full object-cover"
          style={{ width, height }}
        />
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured attendance frame"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 bg-[#09111f]/80 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-[#f4b740]" : "bg-slate-500"}`} />
          {capturedImage ? "Frame captured" : isReady ? "Camera ready" : "Connecting"}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="hidden"
      />

      {children?.({ capture, isCapturing, isReady, error, reset })}
    </div>
  );
}
