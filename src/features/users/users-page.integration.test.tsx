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

  it("writes an applied filter back to the URL and resets the page (S14)", async () => {
    renderPage("/app/users?page=3");
    await expectRows();
    const user = userEvent.setup();

    await user.type(screen.getByRole("searchbox", { name: tUsers("list.filters.search") }), "ada");

    const probe = screen.getByTestId("route-search");
    await waitFor(
      () => {
        expect(probe).toHaveTextContent("search=ada");
      },
      { timeout: 2000 },
    );
    expect(probe).not.toHaveTextContent("page=");
    await waitFor(() => {
      expect(lastUrl?.searchParams.get("search")).toBe("ada");
      expect(lastUrl?.searchParams.get("page")).toBe("1");
    });
  });

  it("applies the status filter through the URL", async () => {
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: tUsers("list.filters.status") }));
    await user.click(await screen.findByRole("option", { name: tUsers("list.status.inactive") }));

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe).toHaveTextContent("isActive=false");
    });
  });

  it("applies the role filter through the URL", async () => {
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: tUsers("list.filters.role") }));
    await user.click(await screen.findByRole("option", { name: "admin" }));

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe).toHaveTextContent("role=admin");
    });
  });

  it("offers every API role even when a filter is already applied (S3)", async () => {
    renderPage("/app/users?role=admin");
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: tUsers("list.filters.role") }));

    expect(await screen.findByRole("option", { name: "admin" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "user" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "viewer" })).toBeInTheDocument();
  });

  it("labels every filter control visibly", async () => {
    renderPage();
    await expectRows();

    const filters = screen.getByRole("search");

    for (const key of ["search", "role", "status"] as const) {
      expect(within(filters).getByText(tUsers(`list.filters.${key}`)).tagName).toBe("LABEL");
      expect(within(filters).getByLabelText(tUsers(`list.filters.${key}`))).toBeInTheDocument();
    }
  });

  it("clears every filter with the labelled icon button", async () => {
    renderPage("/app/users?search=ada&role=admin&isActive=false&page=2");
    await expectRows();
    const user = userEvent.setup();

    const clear = screen.getByRole("button", { name: tUsers("list.filters.clear") });
    expect(clear).toHaveAttribute("title", tUsers("list.filters.clear"));
    expect(clear).toHaveTextContent("");
    await user.click(clear);

    const probe = screen.getByTestId("route-search");
    await waitFor(() => {
      expect(probe.textContent).toBe("");
    });
  });

  it("sorts from the table header through the URL (S2)", async () => {
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Sort by Name" }));

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

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

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
    expect(screen.getAllByRole("button", { name: tUsers("list.actions.create") })).toHaveLength(2);
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

    expect(screen.queryByRole("button", { name: tUsers("list.actions.create") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.edit") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.activate") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.deactivate") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.unlock") })).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("list.actions.delete") })).toBeNull();
  });

  it("shows the row actions the wildcard grant authorizes (S11)", async () => {
    renderPage();
    await expectRows();

    expect(screen.getByRole("button", { name: tUsers("list.actions.create") })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: tUsers("list.actions.edit") })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: tUsers("list.actions.deactivate") })).toHaveLength(
      2,
    );
    expect(
      screen.getByRole("button", { name: tUsers("list.actions.activate") }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: tUsers("list.actions.unlock") })).toBeInTheDocument();
    const edit = screen.getAllByRole("button", { name: tUsers("list.actions.edit") })[0];
    expect(edit).toHaveAttribute("title", tUsers("list.actions.edit"));
    expect(edit).toHaveTextContent("");
    expect(screen.getAllByRole("button", { name: tUsers("list.actions.delete") })).toHaveLength(3);
  });

  it("renders status and role badges and the local creation date (S5)", async () => {
    renderPage();
    await expectRows();

    expect(screen.getAllByText(tUsers("list.status.active"))).toHaveLength(2);
    expect(screen.getByText(tUsers("list.status.inactive"))).toBeInTheDocument();
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
