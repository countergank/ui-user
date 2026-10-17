import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted");

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof skeletonVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(skeletonVariants({ className }))} {...props} />
));
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
