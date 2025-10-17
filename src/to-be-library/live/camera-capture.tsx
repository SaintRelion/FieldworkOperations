import { useEffect, useRef, useState, type ReactNode } from "react";

interface CameraCaptureProps {
  /** Custom UI (buttons, etc.) rendered below the camera feed */
  children?: (controls: {
    capture: () => void;
    isCapturing: boolean;
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  /** Stop the camera stream */
  const stopCamera = () => {
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  };

  const capture = () => {
    if (isCapturing || !videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const w = !width ? videoRef.current.videoWidth : width;
    const h = !height ? videoRef.current.videoHeight : height;

    canvasRef.current.width = w;
    canvasRef.current.height = h;

    ctx.drawImage(videoRef.current, 0, 0, w, h);
    const img = canvasRef.current.toDataURL("image/png");
    setCapturedImage(img);

    // 🕐 auto-reset logic
    setTimeout(() => {
      setIsCapturing(false);
      reset();

      startCamera();
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
    <div className="flex flex-col items-center space-y-2">
      {!capturedImage ? (
        <video
          ref={videoRef}
          autoPlay
          className="w-full rounded-xl border shadow"
          style={{ width, height }}
        />
      ) : (
        <img
          src={capturedImage}
          alt="Captured"
          className="w-full rounded-xl border shadow"
          style={{ width, height }}
        />
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="hidden"
      />

      {children?.({ capture, isCapturing, reset })}
    </div>
  );
}
