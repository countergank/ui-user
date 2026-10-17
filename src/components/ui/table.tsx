import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const tableContainerVariants = cva("relative w-full overflow-auto");

const tableVariants = cva("w-full caption-bottom text-sm");

const tableHeaderVariants = cva("[&_tr]:border-b");

const tableBodyVariants = cva("[&_tr:last-child]:border-0");

const tableFooterVariants = cva("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0");

const tableRowVariants = cva(
  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
);

const tableHeadVariants = cva(
  "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
);

const tableCellVariants = cva("p-2 align-middle [&:has([role=checkbox])]:pr-0");

const tableCaptionVariants = cva("mt-4 text-sm text-muted-foreground");

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>
>(({ className, ...props }, ref) => (
  <div className={cn(tableContainerVariants())}>
    <table ref={ref} className={cn(tableVariants({ className }))} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(tableHeaderVariants({ className }))} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(tableBodyVariants({ className }))} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn(tableFooterVariants({ className }))} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn(tableRowVariants({ className }))} {...props} />
  ),
);
TableRow.displayName = "TableRow";

/**
 * `scope="col"` is explicit rather than left to the browser's implicit association:
 * WCAG H63 asks for it, and it keeps the header meaningful when a caller renders a
 * row header with `scope="row"` instead.
 */
const TableHead = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"th">>(
  ({ className, scope = "col", ...props }, ref) => (
    <th ref={ref} scope={scope} className={cn(tableHeadVariants({ className }))} {...props} />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"td">>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn(tableCellVariants({ className }))} {...props} />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn(tableCaptionVariants({ className }))} {...props} />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableContainerVariants,
  tableVariants,
  tableHeaderVariants,
  tableBodyVariants,
  tableFooterVariants,
  tableRowVariants,
  tableHeadVariants,
  tableCellVariants,
  tableCaptionVariants,
};
