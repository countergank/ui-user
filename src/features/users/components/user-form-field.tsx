import type { ReactNode } from "react";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export const userControlClass =
  "h-10 rounded-[10px] border-input bg-background text-[13px] placeholder:text-muted-foreground";

interface UserFormFieldProps {
  label: string;
  children: ReactNode;
  after?: ReactNode;
}

/**
 * Renders a form field with its label above the control, styled with the users design-system
 * label (12px regular in the panel subtle colour). The control is provided already wrapped in
 * `FormControl`, so the label association and the error wiring of the shadcn form primitives
 * stay intact.
 *
 * @param label - the visible field label; it is associated with the control by
 * `FormControl`'s generated id.
 * @param children - the control element, wrapped in `FormControl` by the caller.
 * @param after - optional content rendered under the error message, such as the password
 * strength indicator or the role impact notice.
 * @returns The labelled field row.
 */
export function UserFormField({ label, children, after }: UserFormFieldProps) {
  return (
    <FormItem>
      <FormLabel className="text-xs font-normal text-panel-subtle">{label}</FormLabel>
      {children}
      <FormMessage />
      {after}
    </FormItem>
  );
}
