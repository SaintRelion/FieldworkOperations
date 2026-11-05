// ============================================================
// MARK: Status components

export function AuditBtn({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: string;
  onClick: () => void;
}) {
  const styles: Record<string, string> = {
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      className={`min-h-9 px-3 text-[10px] font-semibold uppercase transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}
