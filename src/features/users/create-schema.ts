import type { TFunction } from "i18next";
import { z } from "zod";

import { USER_ROLES } from "./types";

const EMAIL_SHAPE = z.string().email();
const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_DIGIT = /[0-9]/;
const PASSWORD_SPECIAL = /[@$!%*?&]/;
const CONSECUTIVE_REPEAT = /(.)\1/;
const COMMON_SEQUENCES = ["123", "abc", "qwe", "asd", "zxc"];

const passwordLengthOk = (value: string) => value.length >= 8 && value.length <= 64;
const passwordCharacterRules = [
  (value: string) => PASSWORD_LOWER.test(value),
  (value: string) => PASSWORD_UPPER.test(value),
  (value: string) => PASSWORD_DIGIT.test(value),
  (value: string) => PASSWORD_SPECIAL.test(value),
  (value: string) => !CONSECUTIVE_REPEAT.test(value),
  (value: string) => !COMMON_SEQUENCES.some((sequence) => value.toLowerCase().includes(sequence)),
];
const passwordRuleChecks = [passwordLengthOk, ...passwordCharacterRules];

export type PasswordStrength = "weak" | "medium" | "strong";

/**
 * @param value - the candidate password, evaluated against the same rule set the create-user
 * schema enforces.
 * @returns `strong` when every schema rule is satisfied, `medium` when the length rule holds and
 * at least four rules are satisfied, `weak` otherwise. The indicator and the schema can never
 * drift because both derive from `passwordRuleChecks`.
 */
export function passwordStrength(value: string): PasswordStrength {
  const satisfied = passwordRuleChecks.filter((check) => check(value)).length;

  if (satisfied === passwordRuleChecks.length) {
    return "strong";
  }
  if (passwordLengthOk(value) && satisfied >= 4) {
    return "medium";
  }
  return "weak";
}

/**
 * @param t - translator bound to the `users` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema mirroring the api-user `POST /admin/users` contract: non-empty
 * identity fields, a valid email, the full password rule set, a confirmation that must match the
 * password (reported on the confirm field only) and the API role enum with the `user` default.
 */
export function createUserFormSchema(t: TFunction<"users">) {
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
      role: z.enum(USER_ROLES).default("user"),
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
