import { useMemo, useState } from "react";
import type { RenderFiltersOptions } from "./render-filters-model";
import { Search } from "lucide-react";

import { Funnel } from "lucide-react";

export function RenderFilters<T>({
  data,
  filters = [],
  searchBy = [],
  onFiltered,
  ui = {},
}: RenderFiltersOptions<T>) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Default UI classes
  const {
    wrapperClass = "flex flex-col border-1 rounded-sm p-4 shadow-sm",
    groupClass = "flex flex-col items-start gap-1",
    labelClass = "text-sm font-medium",
    selectClass = "rounded-md border px-2 py-1",
    inputClass = "w-full rounded-md border pl-10 pr-2 py-2",
  } = ui;

  // Build filter options
  const filterOptions = useMemo(() => {
    const result: Record<string, string[]> = {};
    filters.forEach(({ key }) => {
      const unique = Array.from(new Set(data.map((d) => String(d[key]))));
      result[key as string] = ["All", ...unique];
    });
    return result;
  }, [filters, data]);

  // Apply filter + search
  const applyFilters = (
    newFilterValues: Record<string, string>,
    searchVal: string,
  ) => {
    const filtered = data.filter((item) => {
      const matchesFilters = Object.entries(newFilterValues).every(([k, v]) =>
        !v || v === "All" ? true : String(item[k as keyof T]) === v,
      );

      const matchesSearch = !searchVal
        ? true
        : searchBy.some((k) =>
            String(item[k]).toLowerCase().includes(searchVal.toLowerCase()),
          );

      return matchesFilters && matchesSearch;
    });

    onFiltered?.(filtered);
  };

  const handleFilterChange = (key: keyof T, value: string) => {
    const newValues = { ...filterValues, [key as string]: value };
    setFilterValues(newValues);
    applyFilters(newValues, search);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    applyFilters(filterValues, value);
  };

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between space-x-4">
        {/* Search */}
        {searchBy.length > 0 && (
          <div className="relative w-full">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              className={inputClass}
              placeholder={`Search by ${searchBy.map(String).join(", ")}`}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        )}
        {/* Single filter next to search */}
        {filters.length === 1 && (
          <div className="flex flex-col items-start gap-1">
            <label className={`text-[14px]`}>
              {filters[0].label as string}
            </label>
            <select
              className={`${selectClass} text-sm`}
              value={filterValues[filters[0].key as string] ?? "All"}
              onChange={(e) =>
                handleFilterChange(filters[0].key, e.target.value)
              }
            >
              {filterOptions[filters[0].key as string]?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multiple filters toggle */}
        {filters.length > 1 && (
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 rounded-md border px-3 py-2 transition hover:bg-gray-100"
          >
            <Funnel className="h-4 w-4" />
            Filters
          </button>
        )}
      </div>
      {filters.length > 1 && (
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showFilters ? "mt-3 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-4">
            {filters.map(({ label, key }) => (
              <div key={String(key)} className={groupClass}>
                <label className={labelClass}>{label}</label>
                <select
                  className={selectClass}
                  value={filterValues[key as string] ?? "All"}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                >
                  {filterOptions[key as string]?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
