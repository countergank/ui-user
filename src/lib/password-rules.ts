const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_DIGIT = /[0-9]/;
const PASSWORD_SPECIAL = /[^a-zA-Z0-9]/;
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

export const passwordRuleChecks = [passwordLengthOk, ...passwordCharacterRules];

export type PasswordStrength = "weak" | "medium" | "strong";

export type PasswordRuleId = "length" | "lowercase" | "uppercase" | "digit" | "special" | "unique";

const RULE_IDS: PasswordRuleId[] = [
  "length",
  "lowercase",
  "uppercase",
  "digit",
  "special",
  "unique",
];

export const passwordRuleEntries = RULE_IDS.map((id, index) => ({
  id,
  check: passwordRuleChecks[index],
}));

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
  if (passwordLengthOk(value) && satisfied >= 4) {
    return "medium";
  }
  return "weak";
}
