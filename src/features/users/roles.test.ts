import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { FALLBACK_ROLES, fetchRoles } from "./roles";

const ROLES_URL = "https://test.invalid/roles";

let lastUrl: URL | null = null;

const server = setupServer(
  http.get(ROLES_URL, ({ request }) => {
    lastUrl = new URL(request.url);

    return HttpResponse.json({
      data: [
        { _id: "r1", name: "admin", description: "Admin" },
        { _id: "r2", name: "user", description: "User" },
        { _id: "r3", name: "viewer", description: "Viewer" },
        { _id: "r4", name: "moderator", description: "Moderator" },
      ],
      total: 4,
      page: 1,
      limit: 100,
      totalPages: 1,
    });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
  lastUrl = null;
});

afterAll(() => {
  server.close();
});

describe("fetchRoles", () => {
  it("returns the role names from GET /roles", async () => {
    await expect(fetchRoles()).resolves.toEqual(["admin", "user", "viewer", "moderator"]);
  });

  it("requests the whole catalog in one page", async () => {
    await fetchRoles();

    expect(lastUrl?.searchParams.get("page")).toBe("1");
    expect(lastUrl?.searchParams.get("limit")).toBe("100");
  });

  it("rejects on a malformed envelope so a contract drift fails at the fetcher", async () => {
    server.use(http.get(ROLES_URL, () => HttpResponse.json({ data: "not-a-list" })));

    await expect(fetchRoles()).rejects.toThrow();
  });
});

describe("FALLBACK_ROLES", () => {
  it("keeps the typed fallback catalog for a failing endpoint", () => {
    expect([...FALLBACK_ROLES]).toEqual(["admin", "user", "viewer"]);
  });
});
