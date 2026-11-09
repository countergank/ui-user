import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { createForgotPasswordSchema } from "./forgot-password-schema";

const t = i18n.getFixedT(null, "auth");
const schema = createForgotPasswordSchema(t);

function errorsFor(values: { email: string }) {
  const result = schema.safeParse(values);

  return result.success ? {} : result.error.flatten().fieldErrors;
}

describe("forgot password schema", () => {
  it("accepts a well-formed email", () => {
    expect(schema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("requires an email with the localized message", () => {
    expect(errorsFor({ email: "   " }).email).toEqual([t("forgot.errors.emailRequired")]);
  });

  it("rejects a malformed email with the localized message", () => {
    expect(errorsFor({ email: "not-an-email" }).email).toEqual([t("forgot.errors.emailInvalid")]);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(schema.safeParse({ email: "  user@example.com  " }).success).toBe(true);
  });

  it("translates the same rules in another language", () => {
    const es = i18n.getFixedT("es", "auth");
    const result = createForgotPasswordSchema(es).safeParse({ email: "" });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("the empty email should not validate");
    }
    expect(result.error.flatten().fieldErrors.email).toEqual([es("forgot.errors.emailRequired")]);
  });
});
