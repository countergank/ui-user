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

/**
 * @param t - translator bound to the `users` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema mirroring the api-user `POST /admin/users` contract: non-empty
 * identity fields, a valid email, the full password rule set and the API role enum with the
 * `user` default.
 */
export function createUserFormSchema(t: TFunction<"users">) {
  const required = t("create.errors.fieldRequired");
  const weakPassword = t("create.errors.weakPassword");

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
        (value) => value === "" || EMAIL_SHAPE.safeParse(value).success,
        t("create.errors.emailInvalid"),
      ),
    userName: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
    password: z
      .string()
      .min(8, weakPassword)
      .max(64, weakPassword)
      .refine((value) => PASSWORD_LOWER.test(value), weakPassword)
      .refine((value) => PASSWORD_UPPER.test(value), weakPassword)
      .refine((value) => PASSWORD_DIGIT.test(value), weakPassword)
      .refine((value) => PASSWORD_SPECIAL.test(value), weakPassword)
      .refine((value) => !CONSECUTIVE_REPEAT.test(value), weakPassword)
      .refine(
        (value) => !COMMON_SEQUENCES.some((sequence) => value.toLowerCase().includes(sequence)),
        weakPassword,
      ),
    role: z.enum(USER_ROLES).default("user"),
  });
}

export type CreateUserValues = z.output<ReturnType<typeof createUserFormSchema>>;
export type CreateUserInput = z.input<ReturnType<typeof createUserFormSchema>>;
