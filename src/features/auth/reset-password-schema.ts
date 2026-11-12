import type { TFunction } from "i18next";
import { z } from "zod";

import { passwordRuleEntries } from "@/lib/password-rules";

export const resetPasswordRuleKeys = {
  length: "reset.passwordRules.length",
  lowercase: "reset.passwordRules.lowercase",
  uppercase: "reset.passwordRules.uppercase",
  digit: "reset.passwordRules.digit",
  special: "reset.passwordRules.special",
  unique: "reset.passwordRules.unique",
} as const;

export function createResetPasswordSchema(t: TFunction<"auth">) {
  const password = passwordRuleEntries.reduce<z.ZodType<string>>(
    (schema, { check, id }) => schema.refine(check, t(resetPasswordRuleKeys[id])),
    z.string(),
  );

  return z
    .object({
      password,
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.confirmPassword !== values.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: t("reset.errors.mismatch"),
        });
      }
    });
}

export type ResetPasswordValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
