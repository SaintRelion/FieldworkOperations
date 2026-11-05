import { AccomplishmentReportDialog } from "@/features/AccomplishmentsPage/components/AccomplishmentReportDialog";
import { AddAccomplishmentModal } from "@/features/AccomplishmentsPage/components/AddAccomplishmentModal";
import { DaySection } from "@/features/AccomplishmentsPage/components/DaySection";
import { EmptyState } from "@/features/AccomplishmentsPage/components/EmptyState";
import { useAccomplishmentsPage } from "@/features/AccomplishmentsPage/hooks/useAccomplishmentsPage";
import { Plus } from "lucide-react";

export default function AccomplishmentsPage() {
  const {
    user,
    insertAccomplishment,
    accomplishments,
    showModal,
    setShowModal,
    sortedGrouped,
    handleInsert,
  } = useAccomplishmentsPage();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-5 border-b border-[#152238]/15 pb-7 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">
            Intern / work log
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">
            Accomplishments
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep a dated record of the work you completed during training.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ============================================================ */}
          {/* MARK: Report button */}
          {accomplishments.length > 0 && (
            <AccomplishmentReportDialog
              groupedAccomplishments={sortedGrouped}
            />
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex min-h-11 items-center gap-2 bg-[#1677ff] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0864db]"
          >
            <Plus size={16} />
            Add entry
          </button>
        </div>
      </div>

      {sortedGrouped.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="space-y-6">
          {sortedGrouped.map(([date, items]) => (
            <DaySection key={date} date={date} items={items} />
          ))}
        </div>
      )}

      {showModal && (
        <AddAccomplishmentModal
          userId={user.id}
          onClose={() => setShowModal(false)}
          onSubmit={handleInsert}
          isLoading={insertAccomplishment.isLocked}
        />
      )}
    </div>
  );
}
