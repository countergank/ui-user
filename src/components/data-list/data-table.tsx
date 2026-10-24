import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { SortOrder } from "./params";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortKey?: string;
  align?: "left" | "right";
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  caption?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (sortKey: string) => void;
  empty?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  isLoading = false,
  skeletonRows = 5,
  sortBy,
  sortOrder,
  onSort,
  empty,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  const alignClass = (column: DataTableColumn<T>) =>
    column.align === "right" ? "text-right" : undefined;

  return (
    <div className="relative w-full overflow-auto">
      <Table aria-label={caption}>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            {columns.map((column) => {
              const sorted = column.sortKey !== undefined && column.sortKey === sortBy;

              return (
                <TableHead
                  key={column.key}
                  className={alignClass(column)}
                  aria-sort={
                    sorted ? (sortOrder === "asc" ? "ascending" : "descending") : undefined
                  }
                >
                  {column.sortKey !== undefined && onSort !== undefined ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium"
                      aria-label={
                        typeof column.header === "string"
                          ? t("ui.list.sort.by", { column: column.header })
                          : undefined
                      }
                      onClick={() => {
                        onSort(column.sortKey ?? "");
                      }}
                    >
                      {column.header}
                      {sorted ? (
                        sortOrder === "asc" ? (
                          <ArrowUp aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden="true" className="h-4 w-4 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <TableRow key={`skeleton-${String(rowIndex)}`}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={alignClass(column)}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                {empty ?? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {t("ui.list.empty")}
                  </p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={alignClass(column)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
