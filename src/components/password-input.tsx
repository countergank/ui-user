import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.ComponentPropsWithRef<typeof Input>, "type"> {
  showLabel: string;
  hideLabel: string;
}

/**
 * Renders a password input with a reveal toggle, keeping the input wired to its label and
 * described-by error messages while the button lives outside the wired element.
 *
 * @param showLabel - accessible name and title for the toggle while the value is masked.
 * @param hideLabel - accessible name and title for the toggle while the value is visible.
 * @returns A relative wrapper holding the input (masked until toggled) and the toggle button;
 * every other prop is forwarded to the underlying input.
 */
export function PasswordInput({ showLabel, hideLabel, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? hideLabel : showLabel;

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={() => {
          setVisible((value) => !value);
        }}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  );
}
