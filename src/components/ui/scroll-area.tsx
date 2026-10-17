import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const scrollAreaVariants = cva("relative overflow-hidden");

const scrollAreaViewportVariants = cva("h-full w-full rounded-[inherit]");

const scrollAreaScrollBarVariants = cva("flex touch-none select-none transition-colors", {
  variants: {
    orientation: {
      vertical: "h-full w-2.5 border-l border-l-transparent p-px",
      horizontal: "h-2.5 flex-col border-t border-t-transparent p-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

// `--border` is the thumb colour: the scroll indicator is chrome, so it follows the theme
// instead of being a fixed grey that would disappear in dark mode.
const scrollAreaThumbVariants = cva("relative flex-1 rounded-full bg-border");

const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn(scrollAreaVariants({ className }))} {...props}>
    <ScrollAreaPrimitive.Viewport className={cn(scrollAreaViewportVariants())}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(scrollAreaScrollBarVariants({ orientation, className }))}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className={cn(scrollAreaThumbVariants())} />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export {
  ScrollArea,
  ScrollBar,
  scrollAreaVariants,
  scrollAreaViewportVariants,
  scrollAreaScrollBarVariants,
  scrollAreaThumbVariants,
};
