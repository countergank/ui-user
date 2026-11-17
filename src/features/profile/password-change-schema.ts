import type { TFunction } from "i18next";
import { z } from "zod";

import { passwordRuleEntries } from "@/lib/password-rules";

export const passwordChangeRuleKeys = {
  length: "password.rules.length",
  lowercase: "password.rules.lowercase",
  uppercase: "password.rules.uppercase",
  digit: "password.rules.digit",
  special: "password.rules.special",
  unique: "password.rules.unique",
} as const;

/**
 * @param t - translator bound to the `profile` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema for the change-password form: a non-empty current password, a new
 * password that satisfies every api-side rule of `passwordRuleEntries`, and a confirmation
 * that must match the new password.
 */
export function createPasswordChangeSchema(t: TFunction<"profile">) {
  const newPassword = passwordRuleEntries.reduce<z.ZodType<string>>(
    (schema, { check, id }) => schema.refine(check, t(passwordChangeRuleKeys[id])),
    z.string(),
  );

  return z
    .object({
      currentPassword: z.string().min(1, t("errors.fieldRequired")),
      newPassword,
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.confirmPassword !== values.newPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: t("password.errors.mismatch"),
        });
      }
    });
}

export type PasswordChangeValues = z.output<ReturnType<typeof createPasswordChangeSchema>>;
export type PasswordChangeInput = z.input<ReturnType<typeof createPasswordChangeSchema>>;
