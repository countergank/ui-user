import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { FALLBACK_ROLES } from "../roles";
import { useRolesCatalog } from "./use-roles";

const ROLES_URL = "https://test.invalid/roles";

const CATALOG = {
  data: [
    { _id: "r1", name: "admin", description: "Admin" },
    { _id: "r2", name: "user", description: "User" },
    { _id: "r4", name: "moderator", description: "Moderator" },
  ],
  total: 3,
  page: 1,
  limit: 100,
  totalPages: 1,
};

const server = setupServer(http.get(ROLES_URL, () => HttpResponse.json(CATALOG)));

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

function renderCatalog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return renderHook(() => useRolesCatalog(), { wrapper });
}

describe("useRolesCatalog", () => {
  it("serves the role names from GET /roles", async () => {
    const { result } = renderCatalog();

    await waitFor(() => {
      expect(result.current.roles).toEqual(["admin", "user", "moderator"]);
    });
  });

  it("falls back to the typed catalog when the endpoint fails, without throwing", async () => {
    server.use(http.get(ROLES_URL, () => HttpResponse.json({}, { status: 500 })));
    const { result } = renderCatalog();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect([...result.current.roles]).toEqual([...FALLBACK_ROLES]);
  });
});
