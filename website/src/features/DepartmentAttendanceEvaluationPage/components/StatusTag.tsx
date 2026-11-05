export function StatusTag({ attr }: { attr: string }) {
  if (!attr)
    return (
      <span className="text-[10px] font-semibold text-[#1677ff] uppercase">
        Cleared
      </span>
    );
  const styles: Record<string, string> = {
    excused: "text-blue-500",
    tardy: "text-amber-500",
    absent: "text-rose-500",
  };
  return (
    <span
      className={`text-[9px] font-black tracking-widest uppercase ${styles[attr]}`}
    >
      {attr}
    </span>
  );
}
