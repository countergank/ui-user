import type { TFunction } from "i18next";
import { z } from "zod";

/**
 * Login form validation (COU-281, T4 / S10).
 *
 * A factory, not a constant: every message is localized, and `FormMessage` renders the
 * string zod produced — which is also what `aria-describedby` points at. Building the
 * schema once at module load would freeze whichever language loaded first.
 */
export function createLoginSchema(t: TFunction<"auth">) {
  // Only one of the two email rules may fire: zod aggregates every failing check, and a
  // blank field would otherwise be told both that it is empty and that it is malformed.
  const emailShape = z.string().email();

  return z.object({
    email: z
      .string()
      // Trimmed on the way out, so a stray space is never sent as part of the address.
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
