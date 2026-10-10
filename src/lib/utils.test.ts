// Unit tests for the `cn` classname utility (vitest-001 structure, TEST-1).
import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes keeping the last variant", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps distinct utility classes from different groups", () => {
    expect(cn("p-4", "text-sm", "font-medium")).toBe("p-4 text-sm font-medium");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, 0, "b")).toBe("a b");
  });

  it("flattens nested arrays and object conditions", () => {
    expect(cn("text-base", ["text-sm"], { "font-bold": true, italic: false })).toBe(
      "text-sm font-bold",
    );
  });
});
