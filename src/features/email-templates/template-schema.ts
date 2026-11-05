import type { TFunction } from "i18next";
import { z } from "zod";

export const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param t - translator bound to the `email` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema for the template editor: required name, a slug of lowercase words
 * separated by hyphens, and non-empty subject and body. `slug` is only editable on create; the
 * editor disables the field on edit and the schema still validates the echoed value.
 */
export function templateFormSchema(t: TFunction<"email">) {
  const required = t("templates.errors.fieldRequired");

  return z.object({
    name: z
      .string()
      .trim()
      .refine((value) => value !== "", required),
    slug: z
      .string()
      .trim()
      .refine((value) => value !== "", required)
      .refine((value) => value === "" || SLUG_SHAPE.test(value), t("templates.errors.slugInvalid")),
    subject: z
      .string()
      .trim()
      .refine((value) => value !== "", t("templates.errors.subjectRequired")),
    body: z.string().refine((value) => value.trim() !== "", t("templates.errors.bodyRequired")),
    isActive: z.boolean(),
  });
}

export type TemplateFormValues = z.output<ReturnType<typeof templateFormSchema>>;

/**
 * @param t - translator bound to the `email` namespace.
 * @returns A zod schema for the test-send dialog: one valid recipient address.
 */
export function testEmailFormSchema(t: TFunction<"email">) {
  return z.object({
    to: z
      .string()
      .trim()
      .refine((value) => value !== "", t("templates.errors.fieldRequired"))
      .refine(
        (value) => value === "" || z.string().email().safeParse(value).success,
        t("templates.test.emailInvalid"),
      ),
  });
}

export type TestEmailFormValues = z.output<ReturnType<typeof testEmailFormSchema>>;
