import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { createLoginSchema } from "./login-schema";

const t = i18n.getFixedT(null, "auth");
const schema = createLoginSchema(t);

function errorsFor(values: { email: string; password: string }) {
  const result = schema.safeParse(values);

  return result.success ? {} : result.error.flatten().fieldErrors;
}

describe("login schema", () => {
  it("accepts a well-formed pair", () => {
    expect(schema.safeParse({ email: "user@example.com", password: "secret" }).success).toBe(true);
  });

  it("requires an email with the localized message", () => {
    expect(errorsFor({ email: "   ", password: "secret" }).email).toEqual([
      t("login.errors.emailRequired"),
    ]);
  });

  it("rejects a malformed email with the localized message", () => {
    expect(errorsFor({ email: "not-an-email", password: "secret" }).email).toEqual([
      t("login.errors.emailInvalid"),
    ]);
  });

  it("requires a password with the localized message", () => {
    expect(errorsFor({ email: "user@example.com", password: "" }).password).toEqual([
      t("login.errors.passwordRequired"),
    ]);
  });

  it("translates the same rules in another language", () => {
    const es = i18n.getFixedT("es", "auth");
    const result = createLoginSchema(es).safeParse({ email: "", password: "" });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("the empty pair should not validate");
    }
    expect(result.error.flatten().fieldErrors.email).toEqual([es("login.errors.emailRequired")]);
  });
});
