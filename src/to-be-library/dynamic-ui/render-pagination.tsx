import { useEffect, useState } from "react";
import type { RenderPaginationOptions } from "./render-pagination-model";

export function RenderPagination<T>({
  data,
  currentPage,
  pageSize,
  maxVisiblePages = 5,
  onPageChange,
  showStatus = true,

  ui = {},
}: RenderPaginationOptions<T>) {
  const totalPages = Math.ceil(data.length / pageSize);
  const [initialized, setInitialized] = useState(false);

  // ✅ Default UI classes
  const {
    wrapperClass = "",
    buttonsWrapperClass = "flex items-center gap-2",
    buttonClass = "rounded-lg border px-3 py-1 transition-all cursor-pointer",
    activeButtonClass = "bg-primary text-white",
    disabledButtonClass = "opacity-50 cursor-not-allowed",
    ellipsisClass = "text-muted-foreground px-2",
    statusClass = "text-muted-foreground text-[14px]",
  } = ui;

  useEffect(() => {
    if (!initialized && data.length > 0 && currentPage === 1) {
      onPageChange?.(1, data.slice(0, pageSize));
      setInitialized(true);
    }
  }, [data, initialized, currentPage, pageSize, onPageChange]);

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= maxVisiblePages + 2) {
      // show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const handleClick = (page: number) => {
    const start = (page - 1) * pageSize;
    const sliced = data.slice(start, start + pageSize);

    if (onPageChange) onPageChange(page, sliced);
  };

  return (
    <div
      className={`flex flex-row items-center justify-between gap-3 ${wrapperClass}`}
    >
      {showStatus && (
        <p className={statusClass}>
          Page {currentPage} of {totalPages} - {data.length} Total Data
        </p>
      )}

      <div className={buttonsWrapperClass}>
        <button
          onClick={() => handleClick(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${buttonClass} ${
            currentPage === 1 ? disabledButtonClass : ""
          }`}
        >
          Prev
        </button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={i} className={ellipsisClass}>
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => handleClick(p)}
              className={`${buttonClass} ${
                p === currentPage ? activeButtonClass : ""
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => handleClick(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`${buttonClass} ${
            currentPage === totalPages ? ui.disabledButtonClass : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
