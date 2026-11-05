import type { Accomplishment } from "@/shared/model/Accomplishment";
import { CheckCircle2, ImageOff } from "lucide-react";

// ============================================================
// MARK: Accomplishment card
export function AccomplishmentCard({ item }: { item: Accomplishment }) {
  return (
    <div className="flex items-start gap-4 p-5 sm:px-6">
      <div className="h-16 w-20 shrink-0 overflow-hidden bg-slate-100">
        {item.image ? (
          <img
            src={item.image}
            alt="accomplishment"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
            <ImageOff size={20} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-1">
        <p className="text-sm leading-relaxed text-slate-700">
          {item.description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <CheckCircle2 size={13} className="text-[#1677ff]" />
          <span className="text-[10px] font-semibold tracking-[0.12em] text-[#1677ff] uppercase">
            Logged
          </span>
        </div>
      </div>
    </div>
  );
}
