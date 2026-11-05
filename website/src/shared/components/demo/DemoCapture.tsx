import { demoPhoto } from "@/shared/config/demo";
import type { ReactNode } from "react";
export function DemoCapture({
  children,
}: {
  children?: (controls: {
    capture: () => string;
    isCapturing: boolean;
    isReady: boolean;
    error: null;
    reset: () => void;
  }) => ReactNode;
}) {
  return (
    <div>
      <img
        src={demoPhoto}
        alt="Sample attendance photo"
        className="aspect-video w-full object-cover"
      />
      <p className="mt-3 text-sm text-slate-600">
        Demo only. A sample photo and location are used when you record
        attendance.
      </p>
      {children?.({
        capture: () => demoPhoto,
        isCapturing: false,
        isReady: true,
        error: null,
        reset: () => {},
      })}
    </div>
  );
}
