export interface RenderContentOptions<T> {
  data: T[];

  onItemClick?: (item: T, index: number) => void;
  renderItem?: (item: T, index: number) => React.ReactNode;

  ui?: RenderContentCustomUI;
}

export interface RenderContentCustomUI {
  wrapperClass?: string;
  layoutClass?: string;
  itemHoverClass?: string;

  /** Flags */
  itemsBordered?: boolean;
  itemsShadowed?: boolean;
}
