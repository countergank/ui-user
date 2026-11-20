import type { TFunction } from "i18next";
import { z } from "zod";

import { passwordRuleChecks } from "@/lib/password-rules";

const EMAIL_SHAPE = z.string().email();

/**
 * @param t - translator bound to the `users` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @param roles - the role catalog from `GET /roles`; a role outside it fails with the localized
 * required message, so a drift between the catalog and the form fails on submit.
 * @returns A zod schema mirroring the api-user `POST /admin/users` contract: non-empty
 * identity fields, a valid email, the full password rule set, a confirmation that must match the
 * password (reported on the confirm field only) and a role from the dynamic catalog with the
 * `user` default.
 */
export function createUserFormSchema(t: TFunction<"users">, roles: string[]) {
  const required = t("create.errors.fieldRequired");
  const weakPassword = t("create.errors.weakPassword");
  const passwordMismatch = t("create.errors.passwordMismatch");

  const password = passwordRuleChecks.reduce<z.ZodType<string>>(
    (schema, check) => schema.refine(check, weakPassword),
    z.string(),
  );

  return z
    .object({
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
          (value) => value === "" || EMAIL_SHAPE.safeParse(value).success,
          t("create.errors.emailInvalid"),
        ),
      userName: z
        .string()
        .trim()
        .refine((value) => value !== "", required),
      password,
      confirmPassword: z.string(),
      role: z
        .string()
        .refine((value) => roles.includes(value), required)
        .default("user"),
    })
    .superRefine((values, ctx) => {
      if (values.confirmPassword !== values.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: passwordMismatch,
        });
      }
    });
}

export type CreateUserValues = z.output<ReturnType<typeof createUserFormSchema>>;
export type CreateUserInput = z.input<ReturnType<typeof createUserFormSchema>>;
