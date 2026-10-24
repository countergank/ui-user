import { act, render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { ListParamsConfig } from "../params";
import { useListParams } from "./use-list-params";

const CONFIG: ListParamsConfig = {
  limit: 20,
  sortFields: ["name", "email", "createdAt"],
  defaultSortBy: "createdAt",
  defaultSortOrder: "desc",
  filters: [{ name: "search" }, { name: "role" }, { name: "isActive", values: ["true", "false"] }],
};

interface Captured {
  params: ReturnType<typeof useListParams>["params"];
  setFilter: ReturnType<typeof useListParams>["setFilter"];
  setSort: ReturnType<typeof useListParams>["setSort"];
  setPage: ReturnType<typeof useListParams>["setPage"];
  clearFilters: ReturnType<typeof useListParams>["clearFilters"];
}

let captured: Captured | null = null;

function Probe() {
  const list = useListParams(CONFIG);

  captured = list;

  return <p>{JSON.stringify(list.params)}</p>;
}

function renderProbe(entry: string) {
  const router = createMemoryRouter([{ path: "/app/:section", element: <Probe /> }], {
    initialEntries: [entry],
  });

  render(<RouterProvider router={router} />);

  return router;
}

describe("useListParams", () => {
  it("parses the initial URL into the params object", () => {
    renderProbe("/app/users?page=3&role=admin&isActive=false&sortBy=name");

    expect(captured?.params).toEqual({
      sortBy: "name",
      sortOrder: "desc",
      page: 3,
      limit: 20,
      filters: { role: "admin", isActive: "false" },
    });
  });

  it("applies a filter with replace history and resets the page", () => {
    const router = renderProbe("/app/users?page=3&role=admin");

    act(() => {
      captured?.setFilter("isActive", "false");
    });

    expect(router.state.location.search).toBe("?role=admin&isActive=false");
    expect(router.state.historyAction).toBe("REPLACE");
    expect(captured?.params.page).toBe(1);
  });

  it("clears a filter with a null value", () => {
    const router = renderProbe("/app/users?page=2&role=admin");

    act(() => {
      captured?.setFilter("role", null);
    });

    expect(router.state.location.search).toBe("");
  });

  it("changes the sort with replace history", () => {
    const router = renderProbe("/app/users?page=2");

    act(() => {
      captured?.setSort("email");
    });

    expect(router.state.location.search).toBe("?sortBy=email&sortOrder=asc");
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("changes the page with push history so Back undoes pagination", () => {
    const router = renderProbe("/app/users?page=1&role=admin");

    act(() => {
      captured?.setPage(2);
    });

    expect(router.state.location.search).toBe("?page=2&role=admin");
    expect(router.state.historyAction).toBe("PUSH");
  });

  it("clears filters with replace history and keeps the sort", () => {
    const router = renderProbe("/app/users?page=2&role=admin&isActive=true&sortBy=email");

    act(() => {
      captured?.clearFilters();
    });

    expect(router.state.location.search).toBe("?sortBy=email");
    expect(router.state.historyAction).toBe("REPLACE");
  });
});
