import { describe, expect, it } from "vitest";

import {
  type ListParamsConfig,
  clearListFilters,
  defaultListParams,
  parseListParams,
  serializeListParams,
  withFilter,
  withPage,
  withSort,
} from "./params";

const CONFIG: ListParamsConfig = {
  limit: 20,
  sortFields: ["name", "email", "createdAt"],
  defaultSortBy: "createdAt",
  defaultSortOrder: "desc",
  filters: [{ name: "search" }, { name: "role" }, { name: "isActive", values: ["true", "false"] }],
};

describe("params — parse", () => {
  it("returns defaults when the URL carries no list state", () => {
    expect(parseListParams(new URLSearchParams(""), CONFIG)).toEqual({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 20,
      filters: {},
    });
  });

  it("reads every applied value from the URL (S9)", () => {
    const search = new URLSearchParams(
      "page=3&sortBy=name&sortOrder=asc&search=ada&role=admin&isActive=false",
    );

    expect(parseListParams(search, CONFIG)).toEqual({
      sortBy: "name",
      sortOrder: "asc",
      page: 3,
      limit: 20,
      filters: { search: "ada", role: "admin", isActive: "false" },
    });
  });

  it("keeps tri-state filters tri-state: absent, true and false are three answers", () => {
    expect(parseListParams(new URLSearchParams("isActive=true"), CONFIG).filters.isActive).toBe(
      "true",
    );
    expect(parseListParams(new URLSearchParams("isActive=false"), CONFIG).filters.isActive).toBe(
      "false",
    );
    expect(
      parseListParams(new URLSearchParams("isActive=yes"), CONFIG).filters.isActive,
    ).toBeUndefined();
    expect(parseListParams(new URLSearchParams(""), CONFIG).filters.isActive).toBeUndefined();
  });

  it("falls back to defaults for invalid page values", () => {
    for (const page of ["0", "-2", "abc", "1.5", "999999999999999999999"]) {
      expect(parseListParams(new URLSearchParams(`page=${page}`), CONFIG).page).toBe(1);
    }
  });

  it("rejects a sortBy outside the allowed field list (S8)", () => {
    expect(parseListParams(new URLSearchParams("sortBy=passwordHash"), CONFIG).sortBy).toBe(
      "createdAt",
    );
    expect(parseListParams(new URLSearchParams("sortOrder=up"), CONFIG).sortOrder).toBe("desc");
  });

  it("drops filters that are empty or outside their allowed values", () => {
    const search = new URLSearchParams("role=&isActive=maybe&free=1");

    expect(parseListParams(search, CONFIG).filters).toEqual({});
  });

  it("ignores parameters the list does not declare", () => {
    const search = new URLSearchParams("token=evil&limit=5000&email=x@y.z");

    expect(parseListParams(search, CONFIG)).toEqual(defaultListParams(CONFIG));
  });
});

describe("params — serialize", () => {
  it("round-trips every applied value through the URL", () => {
    const search = "page=2&sortBy=email&sortOrder=asc&search=ada&isActive=false";
    const once = serializeListParams(parseListParams(new URLSearchParams(search), CONFIG), CONFIG);

    const twice = serializeListParams(parseListParams(once, CONFIG), CONFIG);

    expect([...twice.entries()].sort()).toEqual([...once.entries()].sort());
    expect(Object.fromEntries(twice)).toEqual({
      page: "2",
      sortBy: "email",
      sortOrder: "asc",
      search: "ada",
      isActive: "false",
    });
  });

  it("omits defaults so a clean list has an empty query", () => {
    expect(serializeListParams(defaultListParams(CONFIG), CONFIG).toString()).toBe("");
  });

  it("keeps a custom sortBy while a default-equivalent sortOrder stays out of the URL", () => {
    const params = { ...defaultListParams(CONFIG), sortBy: "name", sortOrder: "desc" as const };

    expect(serializeListParams(params, CONFIG).toString()).toBe("sortBy=name");
  });
});

describe("params — transitions", () => {
  it("changing a filter resets the page and keeps the sort", () => {
    const current = parseListParams(
      new URLSearchParams("page=3&sortBy=name&sortOrder=asc&role=admin"),
      CONFIG,
    );
    const next = withFilter(current, "isActive", "false", CONFIG);

    expect(next.page).toBe(1);
    expect(next.sortBy).toBe("name");
    expect(next.sortOrder).toBe("asc");
    expect(next.filters).toEqual({ role: "admin", isActive: "false" });
  });

  it("a null filter value removes the filter and still resets the page", () => {
    const current = parseListParams(new URLSearchParams("page=3&role=admin"), CONFIG);
    const next = withFilter(current, "role", null, CONFIG);

    expect(next.page).toBe(1);
    expect(next.filters).toEqual({});
  });

  it("an out-of-list filter value is dropped, not stored", () => {
    const current = defaultListParams(CONFIG);

    expect(withFilter(current, "isActive", "yes", CONFIG).filters).toEqual({});
  });

  it("changing the sort resets the page", () => {
    const current = parseListParams(new URLSearchParams("page=5&role=admin"), CONFIG);

    expect(withSort(current, "email").page).toBe(1);
    expect(withSort(current, "email").filters).toEqual({ role: "admin" });
  });

  it("a new sort field starts ascending; the same field toggles the order", () => {
    const current = parseListParams(new URLSearchParams("sortBy=name&sortOrder=asc"), CONFIG);

    expect(withSort(current, "email")).toMatchObject({ sortBy: "email", sortOrder: "asc" });
    expect(withSort(current, "name")).toMatchObject({ sortBy: "name", sortOrder: "desc" });
  });

  it("changing the page keeps everything else", () => {
    const current = parseListParams(
      new URLSearchParams("page=2&sortBy=name&sortOrder=asc&role=admin"),
      CONFIG,
    );
    const next = withPage(current, 4);

    expect(next.page).toBe(4);
    expect(next.sortBy).toBe("name");
    expect(next.sortOrder).toBe("asc");
    expect(next.filters).toEqual({ role: "admin" });
  });

  it("withPage never goes below the first page", () => {
    expect(withPage(defaultListParams(CONFIG), 0).page).toBe(1);
    expect(withPage(defaultListParams(CONFIG), -3).page).toBe(1);
  });

  it("clearing filters resets search, filters and page, and keeps the sort", () => {
    const current = parseListParams(
      new URLSearchParams("page=7&sortBy=email&sortOrder=asc&search=ada&role=admin"),
      CONFIG,
    );
    const next = clearListFilters(current);

    expect(next).toEqual({
      sortBy: "email",
      sortOrder: "asc",
      page: 1,
      limit: 20,
      filters: {},
    });
  });
});
