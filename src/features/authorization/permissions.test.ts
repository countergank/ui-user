import { describe, expect, it } from "vitest";

import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("grants a permission the user holds", () => {
    expect(hasPermission(["user:read", "user:update"], "user:read")).toBe(true);
  });

  it("denies a permission the user does not hold", () => {
    expect(hasPermission(["user:read"], "role:read")).toBe(false);
  });

  it("grants everything with the global wildcard", () => {
    expect(hasPermission(["*"], "audit:read")).toBe(true);
  });

  it("grants a permission covered by its resource wildcard", () => {
    expect(hasPermission(["user:*"], "user:update")).toBe(true);
  });

  it("does not let one resource wildcard cover another resource", () => {
    expect(hasPermission(["role:*"], "user:read")).toBe(false);
  });
});
