import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 border-2 border-amber-400 bg-amber-50 p-4 text-sm text-amber-950"
    >
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <strong className="block text-base">This is a demo</strong>
        <p className="mt-1 leading-6">
          {children ??
            "Registration, account changes, and shift settings are disabled. No real accounts will be changed."}
        </p>
      </div>
    </div>
  );
}
