import { Plus } from "lucide-react";

// ============================================================
// MARK: Empty state
export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-[#152238]/20 bg-white px-6 py-14 text-center">
      <h2 className="text-xl font-semibold text-[#152238]">
        No accomplishments yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
        Add your first entry to start a dated record of your training work.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#1677ff] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0864db]"
      >
        <Plus size={16} /> Add First Entry
      </button>
    </div>
  );
}
