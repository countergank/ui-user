import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import {
  type ResetPasswordValues,
  createResetPasswordSchema,
  resetPasswordRuleKeys,
} from "./reset-password-schema";

const t = i18n.getFixedT(null, "auth");
const createSchema = () => createResetPasswordSchema(t);

const BASE = {
  password: "Str0ng!Vault",
  confirmPassword: "Str0ng!Vault",
};

describe("reset password schema", () => {
  it("accepts matching passwords that satisfy every rule", () => {
    const result = createSchema().safeParse(BASE);

    expect(result.success).toBe(true);
  });

  it("rejects each unmet password rule with the localized message", () => {
    const cases: [keyof typeof resetPasswordRuleKeys, string][] = [
      ["length", "Ab1!"],
      ["lowercase", "STR0NG!VAULT"],
      ["uppercase", "str0ng!vault"],
      ["digit", "Strong!vault"],
      ["special", "Strong1vault"],
      ["unique", "Str0ng!Va12ss"],
    ];

    for (const [ruleKey, candidate] of cases) {
      const result = createSchema().safeParse({ ...BASE, password: candidate });

      expect(result.success, `${ruleKey}: ${candidate}`).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(t(resetPasswordRuleKeys[ruleKey]));
      }
    }
  });

  it("reports the mismatch on the confirm field only", () => {
    const result = createSchema().safeParse({
      ...BASE,
      confirmPassword: "Different1!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssues = result.error.issues.filter(
        (issue) => issue.path[0] === "confirmPassword",
      );

      expect(confirmIssues).toHaveLength(1);
      expect(confirmIssues[0]?.message).toBe(t("reset.errors.mismatch"));
      expect(result.error.issues.every((issue) => issue.path[0] !== "password")).toBe(true);
    }
  });

  it("trims nothing out of the password values", () => {
    const result = createSchema().safeParse({
      password: " Str0ng!Vault ",
      confirmPassword: " Str0ng!Vault ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.password).toBe(" Str0ng!Vault ");
    }
  });
});

describe("reset password values type", () => {
  it("keeps only the two form fields", () => {
    const values: ResetPasswordValues = { ...BASE };

    expect(Object.keys(values).sort()).toEqual(["confirmPassword", "password"]);
  });
});
