import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { parseYYYYMMDD } from "@/lib/mydate";

export function LiveClock({
  onTimeChanged,
}: {
  onTimeChanged?: (time: string) => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    let frame: number;
    const update = () => {
      const time = new Date().toISOString();

      setCurrentTime(time);

      if (onTimeChanged) onTimeChanged(time);

      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [currentTime, onTimeChanged]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Clock className="text-muted-foreground h-4 w-4" />
        <p className="text-muted-foreground text-sm">Current Time</p>
      </div>
      <p className="text-3xl font-bold">{parseYYYYMMDD(currentTime)}</p>
    </div>
  );
}
