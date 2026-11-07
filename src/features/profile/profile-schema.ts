import type { TFunction } from "i18next";
import { z } from "zod";

/**
 * @param t - translator bound to the `profile` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema for the editable profile fields: non-empty name and last name. The
 * email is read-only on this screen and stays out of the form.
 */
export function profileFormSchema(t: TFunction<"profile">) {
  const required = t("errors.fieldRequired");

  return z.object({
    name: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
    lastName: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
  });
}

export type ProfileFormValues = z.output<ReturnType<typeof profileFormSchema>>;
export type ProfileFormInput = z.input<ReturnType<typeof profileFormSchema>>;
