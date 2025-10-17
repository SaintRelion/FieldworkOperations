import React, { useEffect, useState } from "react";
import { RenderPagination } from "./render-pagination";

import type {
  FilterOption,
  RenderFiltersCustomUI,
} from "./render-filters-model";
import type { RenderPaginationCustomUI } from "./render-pagination-model";
import type { RenderContentCustomUI } from "./render-content-model";
import { RenderFilters } from "./render-filter";
import { RenderContent } from "./render-content";

export interface RenderHeaderCustomUI {
  /** Called when you want to completely render the header your way */
  renderHeader?: () => React.ReactNode;

  /** Simple title text if you just want something minimal */
  title?: string;

  /** Optional right-side actions beside the title */
  actions?: React.ReactNode;

  /** Classes for styling */
  wrapperClass?: string;
  titleClass?: string;
  actionsClass?: string;
}

export interface RenderDataCoreOptions<T> {
  /** Core data to render */
  data: T[];
  /** Optional wrapper classes */
  wrapperClass?: string;

  /** Header setup */
  headerCustomUI?: RenderHeaderCustomUI;

  /** Filter config */
  enableFilters?: boolean;
  filters?: FilterOption<T>[];
  searchBy?: (keyof T)[];
  filterCustomUI?: RenderFiltersCustomUI;

  /** RenderBlocks config */
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
  contentCustomUI?: RenderContentCustomUI;

  /** Pagination config */
  enablePagination?: boolean;
  pageSize?: number;
  maxVisiblePages?: number;
  paginationCustomUI?: RenderPaginationCustomUI;
}

export function RenderDataCore<T>({
  data,
  wrapperClass = "flex flex-col gap-4",

  // Headers
  headerCustomUI,

  // Filters
  enableFilters = false,
  filters = [],
  searchBy = [],
  filterCustomUI,

  // Content
  renderItem,
  onItemClick,
  contentCustomUI,

  // Pagination
  enablePagination = false,
  pageSize = 10,
  maxVisiblePages = 5,
  paginationCustomUI,
}: RenderDataCoreOptions<T>) {
  /** Internal states */
  const [processedData, setProcessedData] = useState<T[]>(data);
  const [pagedData, setPagedData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setProcessedData(data);
    console.log(data);
  }, [data]);

  /** Handle filters changing */
  const handleFiltered = (newData: T[]) => {
    setProcessedData(newData);
    setCurrentPage(1);
  };

  /** Compute paged data */
  useEffect(() => {
    if (enablePagination) {
      const start = (currentPage - 1) * pageSize;
      const sliced = processedData.slice(start, start + pageSize);
      setPagedData(sliced);
    } else {
      setPagedData(processedData);
    }
  }, [processedData, currentPage, enablePagination, pageSize]);

  /** Handle pagination change (internal only) */
  const handlePageChange = (page: number, sliced: T[]) => {
    setCurrentPage(page);
    setPagedData(sliced);
  };

  /** Render header content */
  const renderHeaderSection = () => {
    if (!headerCustomUI) return null;

    if (headerCustomUI.renderHeader) {
      return headerCustomUI.renderHeader();
    }

    const {
      title,
      actions,
      wrapperClass = "flex items-center justify-between mb-2",
      titleClass = "text-lg font-semibold",
      actionsClass = "flex items-center gap-2",
    } = headerCustomUI;

    if (!title && !actions) return null;

    return (
      <div className={wrapperClass}>
        {title && <h2 className={titleClass}>{title}</h2>}
        {actions && <div className={actionsClass}>{actions}</div>}
      </div>
    );
  };

  return (
    <section className={wrapperClass}>
      {/* HEADER (always above filters) */}
      {renderHeaderSection()}

      {/* FILTERS  */}
      {enableFilters && (
        <RenderFilters
          data={data}
          filters={filters}
          searchBy={searchBy}
          onFiltered={handleFiltered}
          ui={filterCustomUI}
        />
      )}

      {/* Rendered content */}
      <RenderContent
        data={pagedData}
        renderItem={renderItem}
        onItemClick={onItemClick}
        ui={contentCustomUI}
      />

      {/* PAGINATION  */}
      {enablePagination && (
        <RenderPagination
          data={processedData}
          currentPage={currentPage}
          pageSize={pageSize}
          maxVisiblePages={maxVisiblePages}
          onPageChange={handlePageChange}
          ui={paginationCustomUI}
        />
      )}
    </section>
  );
}
