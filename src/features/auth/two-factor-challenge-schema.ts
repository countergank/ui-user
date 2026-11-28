import type { TFunction } from "i18next";
import { z } from "zod";

export function createTwoFactorChallengeSchema(t: TFunction<"auth">) {
  return z.object({
    code: z
      .string()
      .trim()
      .refine((value) => value !== "", t("challenge.errors.codeRequired"))
      .refine((value) => /^\d{6}$/.test(value), t("challenge.errors.codeInvalid")),
  });
}

export type TwoFactorChallengeValues = z.infer<ReturnType<typeof createTwoFactorChallengeSchema>>;
