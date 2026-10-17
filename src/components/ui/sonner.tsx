import { type VariantProps, cva } from "class-variance-authority";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { cn } from "@/lib/utils";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

const toasterVariants = cva("toaster group");

/** The token classes every toast surface inherits, overridable per call site. */
const TOAST_CLASS_NAMES = {
  toast:
    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
  description: "group-[.toaster]:text-muted-foreground",
  actionButton: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground",
  cancelButton: "group-[.toaster]:bg-muted group-[.toaster]:text-muted-foreground",
} as const;

/**
 * Sonner owns the live region and the queue; this wrapper only projects the app's theme
 * preference and design tokens onto it. The preference is already one of
 * `light | dark | system`, which is exactly Sonner's own vocabulary — including
 * `system`, so the OS preference keeps working without resolving it here.
 */
function Toaster({
  className,
  toastOptions,
  ...props
}: ToasterProps & VariantProps<typeof toasterVariants>) {
  const theme = useUiStore(selectTheme);

  return (
    <Sonner
      theme={theme}
      className={cn(toasterVariants({ className }))}
      toastOptions={{
        ...toastOptions,
        classNames: { ...TOAST_CLASS_NAMES, ...toastOptions?.classNames },
      }}
      {...props}
    />
  );
}

export { Toaster, toasterVariants, TOAST_CLASS_NAMES };
