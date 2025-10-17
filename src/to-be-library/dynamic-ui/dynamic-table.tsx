"use client";

import React, { useEffect, useState } from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { ChevronDown } from "lucide-react";
import { Funnel } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DynamicTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: string[];
  allowToggleColumnsHide?: boolean;
  hiddenColumns?: string[];

  headerHeight?: number;
  tableMinWidth?: number;
  dataHeight?: number;
  dataWidth?: number;

  tableClass?: string;
  headerClass?: string;
  dataRowClass?: string;
  renderDataRow?: (row: Row<T>) => string;
}

const DynamicTable = <T,>({
  data,
  columns,
  filters = [],
  allowToggleColumnsHide = true,
  hiddenColumns = [],

  headerHeight = 8,
  dataHeight = 7,
  dataWidth = 4,
  tableMinWidth = 0,

  tableClass: tableClassName = "text-md rounded-md border",
  headerClass: headerClassName = "border-b text-left",
  dataRowClass: dataRowClassName = "border-b",
  renderDataRow: dataRowSpecialClassName,
}: DynamicTableProps<T>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  useEffect(() => {
    if (hiddenColumns.length > 0) {
      const initialVisibility = hiddenColumns.reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {},
      );
      setColumnVisibility(initialVisibility);
    }
  }, [hiddenColumns]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const [filterKey, setFilterKey] = useState(
    filters.length == 1 ? filters[0] : "",
  );

  const row = table.getRowModel().flatRows?.[0]?.original;
  const tableKeys = row ? Object.keys(row).map((k) => k.toLowerCase()) : [];

  const normalizedFilters = filters.map((f) => f.toLowerCase());
  const invalidFilters = normalizedFilters.filter(
    (f) => !tableKeys.includes(f),
  );

  if (table.getRowModel().rows?.length > 0 && invalidFilters.length > 0) {
    throw new Error(
      `Invalid filter keys: ${invalidFilters.join(", ")}. Valid keys: ${tableKeys.join(", ")}`,
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center pb-4">
        {/* Column Filter Function */}
        {filters.length > 0 && (
          <div className="flex gap-2">
            {filterKey && (
              <Input
                placeholder={
                  filters.length == 1 ? `Filter by ${filterKey}` : `Search...`
                }
                value={
                  (table
                    .getColumn(filterKey as string)
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(e) =>
                  table
                    .getColumn(filterKey as string)
                    ?.setFilterValue(e.target.value)
                }
                className="min-w-xs"
              />
            )}
            {filters.length > 1 && (
              <Select onValueChange={(value) => setFilterKey(value)}>
                <SelectTrigger>
                  {filterKey && <SelectValue placeholder={"Filter by..."} />}
                  <Funnel />
                </SelectTrigger>
                <SelectContent>
                  {filters.map((key) => (
                    <SelectItem key={String(key)} value={String(key)}>
                      {String(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Column Hide Function */}
        {allowToggleColumnsHide && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    column.getCanHide() && !hiddenColumns.includes(column.id),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          style={
            tableMinWidth > 0
              ? { minWidth: `${tableMinWidth}px` }
              : { width: "100%" }
          }
          className={tableClassName}
        >
          <thead className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        paddingTop: `${headerHeight}px`,
                        paddingBottom: `${headerHeight}px`,
                      }}
                      className="pl-2"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`${dataRowClassName} ${dataRowSpecialClassName && dataRowSpecialClassName(row)}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        paddingRight: `${dataWidth}px`,
                        paddingTop: `${dataHeight}px`,
                        paddingBottom: `${dataHeight}px`,
                      }}
                      className="pl-2"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 pl-5 text-left text-sm text-gray-700 italic"
                >
                  {data.length > 0 ? "No filter match." : "No results."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
