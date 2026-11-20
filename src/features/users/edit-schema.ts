import type { TFunction } from "i18next";
import { z } from "zod";

/**
 * @param t - translator bound to the `users` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @param roles - the role catalog from `GET /roles`; the current role is accepted even when
 * the catalog failed and fell back, so a prefill never blocks an unrelated edit.
 * @returns A zod schema mirroring the identity slice of the api-user `PATCH /admin/users/:id`
 * contract: non-empty identity fields, a valid email and a role from the dynamic catalog,
 * extended with the user's current role. There is no `password` here; password changes are a
 * separate action and out of scope for this form.
 */
export function editUserFormSchema(t: TFunction<"users">, roles: string[]) {
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
    role: z.string().refine((value) => roles.includes(value), required),
  });
}

export type EditUserValues = z.output<ReturnType<typeof editUserFormSchema>>;
export type EditUserInput = z.input<ReturnType<typeof editUserFormSchema>>;
