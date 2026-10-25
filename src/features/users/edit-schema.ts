import type { TFunction } from "i18next";
import { z } from "zod";

import { USER_ROLES } from "./types";

/**
 * @param t - translator bound to the `users` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema mirroring the identity slice of the api-user `PATCH /admin/users/:id`
 * contract: non-empty identity fields, a valid email and the API role enum. There is no
 * `password` here; password changes are a separate action and out of scope for this form.
 */
export function editUserFormSchema(t: TFunction<"users">) {
  const required = t("edit.errors.fieldRequired");

  return z.object({
    name: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
    lastName: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
    email: z
      .string()
      .trim()
      .refine((value) => value !== "", required)
      .refine(
        (value) => value === "" || z.string().email().safeParse(value).success,
        t("edit.errors.emailInvalid"),
      ),
    userName: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
    role: z.enum(USER_ROLES),
  });
}

export type EditUserValues = z.output<ReturnType<typeof editUserFormSchema>>;
export type EditUserInput = z.input<ReturnType<typeof editUserFormSchema>>;
