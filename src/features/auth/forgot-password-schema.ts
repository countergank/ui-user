import type { TFunction } from "i18next";
import { z } from "zod";

export function createForgotPasswordSchema(t: TFunction<"auth">) {
  const emailShape = z.string().email();

  return z.object({
    email: z
      .string()
      .trim()
      .refine((value) => value !== "", t("forgot.errors.emailRequired"))
      .refine(
        (value) => value === "" || emailShape.safeParse(value).success,
        t("forgot.errors.emailInvalid"),
      ),
  });
}

export type ForgotPasswordValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
