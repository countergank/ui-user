import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { UsersPage } from "./users-page";

const USERS_URL = "https://test.invalid/admin/users";

const tUsers = i18n.getFixedT(null, "users");

const USERS = [
  {
    id: "u1",
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    userName: "ada",
    role: "admin",
    createdAt: "2024-05-01T10:00:00.000Z",
    updatedAt: "2024-05-02T10:00:00.000Z",
    isActive: true,
    lockedUntil: null,
    failedLoginAttempts: 0,
  },
  {
    id: "u2",
    name: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    userName: "grace",
    role: "user",
    createdAt: "2024-05-03T10:00:00.000Z",
    updatedAt: "2024-05-03T10:00:00.000Z",
    isActive: false,
    lockedUntil: null,
    failedLoginAttempts: 2,
  },
  {
    id: "u3",
    name: "Alan",
    lastName: "Turing",
    email: "alan@example.com",
    userName: "alan",
    role: "user",
    createdAt: "2024-05-04T10:00:00.000Z",
    updatedAt: "2024-05-04T10:00:00.000Z",
    isActive: true,
    lockedUntil: new Date(Date.now() + 3_600_000).toISOString(),
    failedLoginAttempts: 5,
  },
];

const PAGE = { data: USERS, total: 3, page: 1, limit: 20, totalPages: 1 };

const ADMIN_PROFILE = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  role: "admin",
  permissions: ["*"],
};

let lastUrl: URL | null = null;
let requestCount = 0;

const server = setupServer(
  http.get(USERS_URL, ({ request }) => {
    lastUrl = new URL(request.url);
    requestCount += 1;

    return HttpResponse.json(PAGE);
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  server.resetHandlers();
  lastUrl = null;
  requestCount = 0;
});

afterAll(() => {
  server.close();
  (Element.prototype as Partial<Element>).hasPointerCapture = undefined;
  (Element.prototype as Partial<Element>).setPointerCapture = undefined;
  (Element.prototype as Partial<Element>).releasePointerCapture = undefined;
  (Element.prototype as Partial<Element>).scrollIntoView = undefined;
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: "ada@example.com",
      userName: "ada",
      name: "Ada",
      lastName: "Lovelace",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
});

function RouteProbe() {
  const { search } = useLocation();

  return <p data-testid="route-search">{search}</p>;
}

function renderPage(entry = "/app/users", permissions: string[] = ["*"]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(permissionsQueryKey, { ...ADMIN_PROFILE, permissions });

  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[entry]}>
          <UsersPage />
          <RouteProbe />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

async function expectRows() {
  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
}

describe("users page — MSW", () => {
  it("renders the rows and always sends page (S7)", async () => {
    renderPage();
    await expectRows();

    expect(lastUrl?.searchParams.get("page")).toBe("1");
    expect(lastUrl?.searchParams.get("limit")).toBe("20");
    expect(lastUrl?.searchParams.get("sortBy")).toBe("createdAt");
    expect(lastUrl?.searchParams.get("sortOrder")).toBe("desc");
    expect(lastUrl?.searchParams.get("search")).toBeNull();
  });

  it("reflects the URL into the request, both directions (S9, S14)", async () => {
    renderPage("/app/users?page=2&search=ada&role=admin&isActive=false&sortBy=email&sortOrder=asc");
    await expectRows();

    expect(lastUrl?.searchParams.get("page")).toBe("2");
    expect(lastUrl?.searchParams.get("search")).toBe("ada");
    expect(lastUrl?.searchParams.get("role")).toBe("admin");
    expect(lastUrl?.searchParams.get("isActive")).toBe("false");
    expect(lastUrl?.searchParams.get("sortBy")).toBe("email");
    expect(lastUrl?.searchParams.get("sortOrder")).toBe("asc");
  });

  it("applies the role filter through the URL and resets the page (S14)", async () => {
    renderPage("/app/users?page=3");
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: tUsers("list.filters.role") }));
    await user.click(await screen.findByRole("option", { name: "admin" }));

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe).toHaveTextContent("role=admin");
    });
    expect(probe).not.toHaveTextContent("page=");
    await waitFor(() => {
      expect(lastUrl?.searchParams.get("role")).toBe("admin");
      expect(lastUrl?.searchParams.get("page")).toBe("1");
    });
  });

  it("clears the role filter with the every-role option", async () => {
    renderPage("/app/users?role=admin");
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: tUsers("list.filters.role") }));
    await user.click(await screen.findByRole("option", { name: tUsers("list.filters.roles") }));

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe.textContent).not.toContain("role=");
    });
  });

  it("offers every API role in the selector and reflects the active one (S3)", async () => {
    renderPage("/app/users?role=admin");
    await expectRows();
    const user = userEvent.setup();

    const trigger = screen.getByRole("combobox", { name: tUsers("list.filters.role") });
    expect(trigger).toHaveTextContent("admin");

    await user.click(trigger);
    expect(await screen.findByRole("option", { name: "user" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "viewer" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: tUsers("list.filters.roles") })).toBeInTheDocument();
  });

  it("paints consecutive avatars with different palette tones", async () => {
    renderPage();
    await expectRows();

    const tones = screen
      .getAllByText(/Ada Lovelace|Grace Hopper|Alan Turing/)
      .map((name) => name.closest("div")?.querySelector("span:first-child")?.className ?? "");

    expect(tones[0]).not.toBe(tones[1]);
    expect(tones[1]).not.toBe(tones[2]);
    expect(tones.every((tone) => /avatar-\d-bg/.test(tone))).toBe(true);
  });

  it("changes the page size from the toolbar and goes back to the first page", async () => {
    renderPage("/app/users?page=2");
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: tUsers("list.pageSize") }));
    await user.click(
      await screen.findByRole("option", { name: `5 / ${tUsers("list.pageShort")}` }),
    );

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe).toHaveTextContent("limit=5");
    });
    expect(probe).not.toHaveTextContent("page=");
  });

  it("shows the page size selector and the summary once", async () => {
    renderPage();
    await expectRows();

    expect(screen.getByRole("combobox", { name: tUsers("list.pageSize") })).toHaveTextContent("20");

    const summary = i18n.getFixedT(null, "common")("ui.list.pagination.summary", {
      from: 1,
      to: 3,
      total: 3,
    });

    expect(screen.getAllByText(summary)).toHaveLength(1);
  });

  it("sorts from the table header through the URL (S2)", async () => {
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: `Sort by ${tUsers("list.columns.user").toUpperCase()}` }),
    );

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe).toHaveTextContent("sortBy=name");
      expect(probe).toHaveTextContent("sortOrder=asc");
    });
  });

  it("paginates from the footer through the URL", async () => {
    server.use(
      http.get(USERS_URL, ({ request }) => {
        lastUrl = new URL(request.url);

        return HttpResponse.json({ ...PAGE, totalPages: 3, total: 60 });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe).toHaveTextContent("page=2");
    });
  });

  it("shows the empty state with its CTA (S10)", async () => {
    server.use(
      http.get(USERS_URL, () =>
        HttpResponse.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      ),
    );

    renderPage();

    expect(await screen.findByText(tUsers("list.empty"))).toBeInTheDocument();
    const createLinks = screen.getAllByRole("link", { name: tUsers("list.actions.create") });
    expect(createLinks).toHaveLength(2);
    for (const link of createLinks) {
      expect(link).toHaveAttribute("href", "/app/users/new");
    }
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
  });

  it("shows the error state and recovers with retry (S10)", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json({}, { status: 500 })));

    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load data");
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();

    server.use(http.get(USERS_URL, () => HttpResponse.json(PAGE)));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await expectRows();
  });

  it("hides every action from a user:read-only session (S4, S11)", async () => {
    renderPage("/app/users", ["user:read"]);
    await expectRows();

    expect(screen.queryByRole("link", { name: tUsers("list.actions.create") })).toBeNull();
    expect(screen.queryByRole("link", { name: tUsers("list.actions.edit") })).toBeNull();
    expect(screen.getAllByRole("link", { name: tUsers("list.actions.view") })).toHaveLength(3);
    expect(screen.queryByRole("button", { name: tUsers("list.actions.activate") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.deactivate") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.unlock") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.delete") })).toBeNull();
  });

  it("shows the row actions the wildcard grant authorizes (S11)", async () => {
    renderPage();
    await expectRows();

    const createLink = screen.getByRole("link", { name: tUsers("list.actions.create") });
    expect(createLink).toHaveAttribute("href", "/app/users/new");
    const editLinks = screen.getAllByRole("link", { name: tUsers("list.actions.edit") });
    expect(editLinks).toHaveLength(3);
    expect(editLinks[0]).toHaveAttribute("href", "/app/users/u1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/app/users/u2/edit");
    expect(editLinks[2]).toHaveAttribute("href", "/app/users/u3/edit");
    expect(screen.getAllByRole("button", { name: tUsers("list.actions.deactivate") })).toHaveLength(
      2,
    );
    expect(
      screen.getByRole("button", { name: tUsers("list.actions.activate") }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: tUsers("list.actions.unlock") })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: tUsers("list.actions.delete") })).toHaveLength(3);
  });

  it("links every row to its own detail page (COU-291 S9)", async () => {
    renderPage();
    await expectRows();

    const viewLinks = screen.getAllByRole("link", { name: tUsers("list.actions.view") });
    expect(viewLinks).toHaveLength(3);
    expect(viewLinks[0]).toHaveAttribute("href", "/app/users/u1");
    expect(viewLinks[1]).toHaveAttribute("href", "/app/users/u2");
    expect(viewLinks[2]).toHaveAttribute("href", "/app/users/u3");
  });

  it("renders each status in its own tone, the role and the local creation date (S5)", async () => {
    renderPage();
    await expectRows();

    const table = within(screen.getByRole("table"));
    const active = table.getAllByText(new RegExp(tUsers("list.status.active")));

    expect(active).toHaveLength(1);
    expect(active[0]).toHaveClass("text-success");
    expect(table.getByText(new RegExp(tUsers("list.status.inactive")))).toHaveClass(
      "text-muted-foreground",
    );
    expect(table.getByText(new RegExp(tUsers("list.status.blocked")))).toHaveClass(
      "text-destructive",
    );
    expect(screen.getAllByText("admin").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2024/)).toHaveLength(3);
  });

  it("refetches the current page from the refresh control", async () => {
    const user = userEvent.setup();
    renderPage("/app/users?page=2");

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(0);
    });
    const before = requestCount;

    await user.click(screen.getByRole("button", { name: i18n.t("ui.list.refresh") }));

    await waitFor(() => {
      expect(requestCount).toBe(before + 1);
    });
    expect(lastUrl?.searchParams.get("page")).toBe("2");
  });

  it("has no axe violations on the loaded page (S12)", async () => {
    const { container } = renderPage();
    await expectRows();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("UsersPage KPIs", () => {
  it("shows the percentage line under the total and the active counts", async () => {
    renderPage();

    const tUsers = i18n.getFixedT(null, "users");

    expect(await screen.findByText(tUsers("list.kpi.totalHint"))).toBeTruthy();
    expect(screen.getByText(tUsers("list.kpi.activeHint"))).toBeTruthy();
  });
});

describe("UsersPage header", () => {
  it("reports how many accounts exist, from the list total", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json({ ...PAGE, total: 1248 })));

    renderPage();

    const expected = i18n.getFixedT(null, "users")("list.subtitle", {
      count: 1248,
      roles: 3,
      permissions: 22,
    });

    expect(await screen.findByText(expected)).toBeTruthy();
  });
});
