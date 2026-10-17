import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const breadcrumbListVariants = cva(
  "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
);

const breadcrumbItemVariants = cva("inline-flex items-center gap-1.5");

const breadcrumbLinkVariants = cva("transition-colors hover:text-foreground");

const breadcrumbPageVariants = cva("font-normal text-foreground");

const breadcrumbSeparatorVariants = cva("[&>svg]:size-3.5");

const breadcrumbEllipsisVariants = cva("flex h-9 w-9 items-center justify-center");

/**
 * The landmark label is the one string in this folder that is not read from i18n:
 * The landmark label is copy a screen-reader user hears, so it comes from the bundle
 * (`ui.breadcrumb.label`, ADR-12). `props` spreads after the default, so a caller with a
 * more specific landmark name can still override it.
 */
const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();

    return <nav ref={ref} aria-label={t("ui.breadcrumb.label")} className={className} {...props} />;
  },
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn(breadcrumbListVariants({ className }))} {...props} />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn(breadcrumbItemVariants({ className }))} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp ref={ref} className={cn(breadcrumbLinkVariants({ className }))} {...props}>
        {children}
      </Comp>
    );
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

/**
 * The current page is text, not a link: `aria-current="page"` makes assistive technology
 * announce "current page" (the WAI-ARIA breadcrumb pattern) without the fake `link` role
 * the shadcn source adds — an interactive role on a non-focusable span is an a11y lint
 * failure here and would advertise a tab stop that does not exist.
 */
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn(breadcrumbPageVariants({ className }))}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(breadcrumbSeparatorVariants({ className }))}
      {...props}
    >
      {children ?? <ChevronRight aria-hidden="true" />}
    </li>
  ),
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

/**
 * Unlike the shadcn source, the wrapper is not `aria-hidden`: the collapsed segments are a
 * real thing to announce, and hiding the wrapper would hide the translated label with it.
 */
const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => {
  const { t } = useTranslation();

  return (
    <span ref={ref} className={cn(breadcrumbEllipsisVariants({ className }))} {...props}>
      <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{t("ui.breadcrumb.more")}</span>
    </span>
  );
});
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  breadcrumbListVariants,
  breadcrumbItemVariants,
  breadcrumbLinkVariants,
  breadcrumbPageVariants,
  breadcrumbSeparatorVariants,
  breadcrumbEllipsisVariants,
};
