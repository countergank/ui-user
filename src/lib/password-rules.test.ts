import { describe, expect, it } from "vitest";

import { passwordRuleChecks, passwordRules, passwordStrength } from "./password-rules";

const VALID = "Str0ng!Vault";
const TOO_SHORT = "Ab1!";
const NO_UPPER = "str0ng!pass";
const NO_LOWER = "STR0NG!PASS";
const NO_DIGIT = "Strong!pass";
const NO_SPECIAL = "Strong1pass";
const REPEATED = "Aa1!aa1!";
const SEQUENCE = "Abc1!def";

describe("password rules", () => {
  it("accepts a password satisfying every rule", () => {
    expect(passwordRuleChecks.every((check) => check(VALID))).toBe(true);
  });

  it("rejects a password failing each individual rule", () => {
    const failures = [TOO_SHORT, NO_UPPER, NO_LOWER, NO_DIGIT, NO_SPECIAL, REPEATED, SEQUENCE];

    for (const candidate of failures) {
      expect(
        passwordRuleChecks.every((check) => check(candidate)),
        candidate,
      ).toBe(false);
    }
  });

  it("reports length and character requirements per rule", () => {
    const rules = passwordRules("ab1!");

    expect(rules.find((rule) => rule.id === "length")?.satisfied).toBe(false);
    expect(rules.find((rule) => rule.id === "uppercase")?.satisfied).toBe(false);
    expect(rules.find((rule) => rule.id === "lowercase")?.satisfied).toBe(true);
    expect(rules.find((rule) => rule.id === "digit")?.satisfied).toBe(true);
    expect(rules.find((rule) => rule.id === "special")?.satisfied).toBe(true);
  });

  it("marks the uniqueness rules satisfied for a clean password", () => {
    const rules = passwordRules(VALID);

    expect(rules.find((rule) => rule.id === "unique")?.satisfied).toBe(true);
  });

  it("keeps the strength bands aligned with the rule set", () => {
    expect(passwordStrength(VALID)).toBe("strong");
    expect(passwordStrength(TOO_SHORT)).toBe("weak");
  });
});
