import type { TFunction } from "i18next";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

import { cn } from "@/lib/utils";

import { type CreateUserInput, passwordStrength } from "./create-schema";

const STRENGTH_BANDS = ["weak", "medium", "strong"] as const;

const BAND_BAR_CLASSES = {
  weak: "bg-red-500",
  medium: "bg-amber-500",
  strong: "bg-green-600",
} as const;

interface PasswordStrengthIndicatorProps {
  control: Control<CreateUserInput>;
  t: TFunction<"users">;
}

/**
 * @param control - the react-hook-form control the password field belongs to; the indicator
 * follows the live password value.
 * @param t - translator bound to the `users` namespace, so the band text is localized. The text,
 * not the colour, carries the meaning; the bars are decorative.
 * @returns A live-region indicator for the password strength, or `null` while the password is
 * empty.
 */
export function PasswordStrengthIndicator({ control, t }: PasswordStrengthIndicatorProps) {
  const value = useWatch({ control, name: "password" });

  if (value.length === 0) {
    return null;
  }

  const band = passwordStrength(value);
  const activeIndex = STRENGTH_BANDS.indexOf(band);
  const announcement = t("create.passwordStrength.label", {
    strength: t(`create.passwordStrength.${band}`),
  });

  return (
    <output className="block space-y-1">
      <div className="flex gap-1" aria-hidden="true">
        {STRENGTH_BANDS.map((step, index) => (
          <div
            key={step}
            className={cn(
              "h-1 flex-1 rounded-full",
              index <= activeIndex ? BAND_BAR_CLASSES[step] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{announcement}</p>
    </output>
  );
}
