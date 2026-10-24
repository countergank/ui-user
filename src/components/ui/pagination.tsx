import { type VariantProps, cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button";

const paginationVariants = cva("mx-auto flex w-full justify-center");

const paginationContentVariants = cva("flex flex-row items-center gap-1");

const paginationLinkVariants = cva("gap-1");

const paginationPreviousVariants = cva("pl-2.5");

const paginationNextVariants = cva("pr-2.5");

const paginationEllipsisVariants = cva("flex h-9 w-9 items-center justify-center");

function Pagination({ className, ...props }: React.ComponentPropsWithoutRef<"nav">) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("ui.pagination.label")}
      className={cn(paginationVariants({ className }))}
      {...props}
    />
  );
}
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn(paginationContentVariants({ className }))} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={className} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

interface PaginationLinkProps
  extends React.ComponentPropsWithoutRef<"a">,
    Pick<VariantProps<typeof buttonVariants>, "size"> {
  isActive?: boolean;
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, size = "icon", children, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
        paginationLinkVariants({ className }),
      )}
      {...props}
    >
      {children}
    </a>
  ),
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
    const label = t("ui.pagination.previous");

    return (
      <PaginationLink
        ref={ref}
        aria-label={label}
        size="default"
        className={cn(paginationPreviousVariants({ className }))}
        {...props}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        <span>{label}</span>
      </PaginationLink>
    );
  },
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
    const label = t("ui.pagination.next");

    return (
      <PaginationLink
        ref={ref}
        aria-label={label}
        size="default"
        className={cn(paginationNextVariants({ className }))}
        {...props}
      >
        <span>{label}</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </PaginationLink>
    );
  },
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => {
  const { t } = useTranslation();

  return (
    <span ref={ref} className={cn(paginationEllipsisVariants({ className }))} {...props}>
      <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{t("ui.pagination.morePages")}</span>
    </span>
  );
});
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  paginationVariants,
  paginationContentVariants,
  paginationLinkVariants,
  paginationPreviousVariants,
  paginationNextVariants,
  paginationEllipsisVariants,
};
