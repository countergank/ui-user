import type { TFunction } from "i18next";
import { z } from "zod";

export function createLoginSchema(t: TFunction<"auth">) {
  const emailShape = z.string().email();

  return z.object({
    email: z
      .string()
      .trim()
      .refine((value) => value !== "", t("login.errors.emailRequired"))
      .refine(
        (value) => value === "" || emailShape.safeParse(value).success,
        t("login.errors.emailInvalid"),
      ),
    password: z.string().min(1, t("login.errors.passwordRequired")),
  });
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
