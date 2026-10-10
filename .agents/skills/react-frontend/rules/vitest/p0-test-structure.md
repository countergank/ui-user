---
priority: P0
category: vitest
---

# Structure Tests with Describe/It/Expect

**Do**: Group tests with `describe` blocks that mirror the module structure. Use `it` (or `test`) for individual assertions. Name tests after the expected behavior, not the implementation detail.

**Avoid**: Nesting `describe` blocks more than two levels deep. Writing tests that verify internal state instead of observable behavior.

**Example**:
```ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats positive amounts with currency symbol", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  it("formats negative amounts with leading minus", () => {
    expect(formatCurrency(-50, "USD")).toBe("-$50.00");
  });

  it("handles zero as a valid amount", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});
```
