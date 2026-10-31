import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

export interface ListPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageEntry = number | "ellipsis";

export function pageWindow(page: number, totalPages: number): PageEntry[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const wanted = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  const sorted = [...wanted]
    .filter((candidate) => candidate >= 1 && candidate <= totalPages)
    .sort((a, b) => a - b);

  const entries: PageEntry[] = [];
  let previous = 0;
  for (const candidate of sorted) {
    if (candidate - previous > 1) {
      entries.push("ellipsis");
    }
    entries.push(candidate);
    previous = candidate;
  }

  return entries;
}

export function ListPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
}: ListPaginationProps) {
  const { t } = useTranslation();

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {t("ui.list.pagination.summary", { from, to, total })}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-canvas"
              aria-label={t("ui.list.pagination.previous")}
              disabled={page <= 1}
              onClick={() => {
                onPageChange(page - 1);
              }}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-8 bg-canvas px-2"
              aria-label={t("ui.list.pagination.page", { page })}
              aria-current="page"
              onClick={() => {
                onPageChange(page);
              }}
            >
              {page}
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-canvas"
              aria-label={t("ui.list.pagination.next")}
              disabled={page >= totalPages}
              onClick={() => {
                onPageChange(page + 1);
              }}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
