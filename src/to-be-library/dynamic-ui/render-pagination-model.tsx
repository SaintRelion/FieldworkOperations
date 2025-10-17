export interface RenderPaginationOptions<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  maxVisiblePages?: number;
  onPageChange?: (page: number, sliced: T[]) => void;
  showStatus?: boolean;

  ui?: RenderPaginationCustomUI;
}

export interface RenderPaginationCustomUI {
  wrapperClass?: string;
  buttonsWrapperClass?: string;
  buttonClass?: string;
  activeButtonClass?: string;
  disabledButtonClass?: string;
  ellipsisClass?: string;
  statusClass?: string;
}
