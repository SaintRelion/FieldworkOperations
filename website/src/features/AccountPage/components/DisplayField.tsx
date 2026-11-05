import type { DisplayFieldProps } from "@/features/AccountPage/model/types";

export function DisplayField({ label, value, icon: Icon }: DisplayFieldProps) {
  return (
    <div className="border-b border-slate-200 py-4">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <label className="text-xs font-medium text-slate-500">{label}</label>
      </div>
      <div className="text-sm font-semibold text-slate-800">{value || "—"}</div>
    </div>
  );
}
