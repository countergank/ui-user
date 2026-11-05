import { describe, expect, it } from "vitest";

import { emailTemplatesQueryFromFilters } from "./api";

describe("emailTemplatesQueryFromFilters", () => {
  it("keeps the tri-state active filter exact (S1)", () => {
    expect(emailTemplatesQueryFromFilters(1, 20, "true").active).toBe(true);
    expect(emailTemplatesQueryFromFilters(1, 20, "false").active).toBe(false);
    expect(emailTemplatesQueryFromFilters(1, 20, undefined).active).toBeUndefined();
  });

  it("passes pagination through as it was applied", () => {
    expect(emailTemplatesQueryFromFilters(3, 50, undefined)).toEqual({
      page: 3,
      limit: 50,
      active: undefined,
    });
  });
});
