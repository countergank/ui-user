const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_DIGIT = /[0-9]/;
const PASSWORD_SPECIAL = /[^a-zA-Z0-9]/;
const CONSECUTIVE_REPEAT = /(.)\1/;
const COMMON_SEQUENCES = ["123", "abc", "qwe", "asd", "zxc"];

export type PasswordStrength = "weak" | "medium" | "strong";

export type PasswordRuleId = "length" | "lowercase" | "uppercase" | "digit" | "special" | "unique";

export const passwordRuleEntries: { id: PasswordRuleId; check: (value: string) => boolean }[] = [
  { id: "length", check: (value) => value.length >= 8 && value.length <= 64 },
  { id: "lowercase", check: (value) => PASSWORD_LOWER.test(value) },
  { id: "uppercase", check: (value) => PASSWORD_UPPER.test(value) },
  { id: "digit", check: (value) => PASSWORD_DIGIT.test(value) },
  { id: "special", check: (value) => PASSWORD_SPECIAL.test(value) },
  {
    id: "unique",
    check: (value) =>
      !CONSECUTIVE_REPEAT.test(value) &&
      !COMMON_SEQUENCES.some((sequence) => value.toLowerCase().includes(sequence)),
  },
];

const LENGTH_RULE = passwordRuleEntries.find(({ id }) => id === "length")?.check;

export const passwordRuleChecks = passwordRuleEntries.map(({ check }) => check);

/**
 * @param value - the candidate password, evaluated against the same rule set the api-user
 * `@PasswordStrength` decorator enforces.
 * @returns One entry per rule, in checklist order, stating whether the value satisfies it.
 */
export function passwordRules(value: string): { id: PasswordRuleId; satisfied: boolean }[] {
  return passwordRuleEntries.map(({ id, check }) => ({ id, satisfied: check(value) }));
}

/**
 * @param value - the candidate password, evaluated against the same rule set the api-user
 * `@PasswordStrength` decorator enforces.
 * @returns `strong` when every rule is satisfied, `medium` when the length rule holds and at
 * least four rules are satisfied, `weak` otherwise.
 */
export function passwordStrength(value: string): PasswordStrength {
  const satisfied = passwordRuleChecks.filter((check) => check(value)).length;

  if (satisfied === passwordRuleChecks.length) {
    return "strong";
  }
  if (LENGTH_RULE?.(value) && satisfied >= 4) {
    return "medium";
  }
  return "weak";
}
