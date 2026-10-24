import { describe, expect, it } from "vitest";

import type { ListParams } from "@/components/data-list/params";

import { usersQueryFromListParams } from "./api";

const BASE: ListParams = {
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 2,
  limit: 20,
  filters: {},
};

describe("usersQueryFromListParams", () => {
  it("maps the generic params onto the api-user query (S8, S13)", () => {
    expect(usersQueryFromListParams(BASE)).toEqual({
      page: 2,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: undefined,
      role: undefined,
      isActive: undefined,
    });
  });

  it("keeps the tri-state isActive answer exact", () => {
    expect(usersQueryFromListParams({ ...BASE, filters: { isActive: "true" } }).isActive).toBe(
      true,
    );
    expect(usersQueryFromListParams({ ...BASE, filters: { isActive: "false" } }).isActive).toBe(
      false,
    );
    expect(usersQueryFromListParams(BASE).isActive).toBeUndefined();
  });

  it("passes search and role through as they were applied", () => {
    const query = usersQueryFromListParams({
      ...BASE,
      filters: { search: "ada", role: "admin" },
    });

    expect(query.search).toBe("ada");
    expect(query.role).toBe("admin");
  });
});
