export interface FilterOption<T> {
  label: string;
  key: keyof T;
}

export interface RenderFiltersOptions<T> {
  data: T[];
  filters?: FilterOption<T>[];
  searchBy?: (keyof T)[];
  onFiltered?: (filteredData: T[]) => void;

  /** Class-only customization (like RenderBlocks / RenderPagination) */
  ui?: RenderFiltersCustomUI;
}

export interface RenderFiltersCustomUI {
  wrapperClass?: string;
  groupClass?: string;
  labelClass?: string;
  selectClass?: string;
  inputClass?: string;
}
