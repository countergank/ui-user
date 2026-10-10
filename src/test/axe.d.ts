// src/test/axe.d.ts
// Type augmentation so `expect(...).toHaveNoViolations()` (vitest-axe) typechecks
// on Vitest's Assertion. Augments module "vitest" the same way
// @testing-library/jest-dom/vitest does (proven vitest 3 pattern).
import type { AxeMatchers } from "vitest-axe";

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- type augmentation merges members; extends is required, the interface itself is intentionally empty.
  interface Assertion extends AxeMatchers {}
}
