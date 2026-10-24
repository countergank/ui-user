import type { AxeMatchers } from "vitest-axe";

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- type augmentation merges members; extends is required, the interface itself is intentionally empty.
  interface Assertion extends AxeMatchers {}
}
