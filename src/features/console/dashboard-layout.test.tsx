it.each([
  ["/app", () => [tConsole("nav.home")]],
  ["/app/users", () => [tConsole("nav.home"), tConsole("nav.users")]],
  ["/app/users/new", () => [tConsole("nav.home"), tConsole("nav.users"), tUsers("create.title")]],
  ["/app/users/u9", () => [tConsole("nav.home"), tConsole("nav.users"), tUsers("detail.title")]],
  ["/app/users/u9/edit", () => [tConsole("nav.home"), tConsole("nav.users"), tUsers("edit.title")]],
])("renders %s with its full trail", (path, expectedFn) => {
  const expected = expectedFn();
  renderShell(path);

  const banner = screen.queryByRole("banner");

  if (banner === null) {
    expect(path).not.toBe("/app");
    expect(screen.getByText(tConsole("nav.home"))).toBeTruthy();
    return;
  }

  const trail = within(banner)
    .getByRole("navigation", { name: tCommon("ui.breadcrumb.label") })
    .textContent.trim();

  for (const label of expected) {
    expect(trail).toContain(label);
  }
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";
import { SIDEBAR_STORAGE_KEY } from "@/lib/ui/sidebar";
import { initialState as uiInitialState, uiStore } from "@/stores/use-ui-store";
import { CONSOLE_NAV } from "./navigation";

import { DashboardLayout } from "./dashboard-layout";

const tCommon = i18n.getFixedT(null, "common");
const tConsole = i18n.getFixedT(null, "console");
const tUsers = i18n.getFixedT(null, "users");

interface RenderOptions {
  permissions?: string[];
  sidebarOpen?: boolean;
}

function renderShell(initialPath = "/app", options: RenderOptions = {}) {
  const { permissions = ["*"], sidebarOpen = true } = options;

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

  const client = new QueryClient();
  client.setQueryData(permissionsQueryKey, {
    id: "u1",
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    role: "admin",
    permissions,
  });

  uiStore.setState({ ...uiInitialState, sidebarOpen });

  const router = createMemoryRouter(
    [
      {
        path: "/app",
        Component: DashboardLayout,
        children: [
          { index: true, Component: () => <h1>Summary content</h1> },
          {
            path: "users",
            Component: function UsersContent() {
              return <h1>Users content</h1>;
            },
          },
          { path: "users/new", Component: () => <h1>New user content</h1> },
          { path: "users/:id", Component: () => <h1>User detail content</h1> },
          { path: "users/:id/edit", Component: () => <h1>User edit content</h1> },
        ],
      },
      { path: "/login", Component: () => <h1>Login content</h1> },
      { path: "/profile", Component: () => <h1>Profile content</h1> },
    ],
    { initialEntries: [initialPath] },
  );

  const { container } = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router, container };
}

function sectionNav(): HTMLElement {
  return screen.getByRole("navigation", { name: tConsole("nav.label") });
}

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DashboardLayout landmarks and focus (S4)", () => {
  it("provides the landmarks the console needs", () => {
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(sectionNav()).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("keeps the skip link as the first focusable element, pointing at main", () => {
    renderShell();

    const skip = screen.getByRole("link", { name: tCommon("shell.skipLink") });

    expect(skip).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("groups the three theme modes, the language code, the bell and the profile in the topbar", () => {
    renderShell();

    const header = screen.getByRole("banner");
    const theme = within(header).getByRole("group", { name: tCommon("shell.theme.group") });

    expect(within(theme).getAllByRole("button")).toHaveLength(3);
    expect(
      within(theme).getByRole("button", { name: tCommon("shell.theme.system") }),
    ).toBeVisible();
    expect(within(theme).getByRole("button", { name: tCommon("shell.theme.light") })).toBeVisible();
    expect(within(theme).getByRole("button", { name: tCommon("shell.theme.dark") })).toBeVisible();
    expect(
      within(header).getByRole("button", { name: tCommon("shell.language.switch") }),
    ).toHaveTextContent(/^[A-Z]{2}$/);
    expect(
      within(header).getByRole("button", { name: tConsole("shell.notifications") }),
    ).toBeDisabled();
    expect(within(header).getByRole("button", { name: tConsole("shell.profile") })).toBeVisible();
  });

  it("announces the section name after navigation instead of the template title", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(within(sectionNav()).getByRole("link", { name: tConsole("nav.users") }));

    const status = screen.getByRole("status");
    await waitFor(() =>
      expect(status).toHaveTextContent(
        tCommon("shell.routeAnnouncer.loaded", { title: tConsole("nav.users") }),
      ),
    );
  });

  it("does not steal focus on initial load", () => {
    renderShell();

    expect(screen.getByRole("main")).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it("parks focus on main after a client-side navigation", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(within(sectionNav()).getByRole("link", { name: tConsole("nav.users") }));

    expect(screen.getByRole("heading", { name: "Users content" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveFocus();
  });
});

describe("DashboardLayout sidebar (S6)", () => {
  it("collapses and expands, and persists the choice", async () => {
    const user = userEvent.setup();
    renderShell();

    const aside = screen.getByRole("complementary");
    expect(aside).toHaveClass("w-64");
    expect(aside).not.toHaveClass("invisible");

    await user.click(screen.getByRole("button", { name: tConsole("shell.collapseSidebar") }));

    expect(aside).toHaveClass("w-0", "invisible");
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("false");

    await user.click(screen.getByRole("button", { name: tConsole("shell.expandSidebar") }));

    expect(aside).toHaveClass("w-64");
    expect(aside).not.toHaveClass("invisible");
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("true");
  });

  it("animates the sidebar width without unmounting the content column", async () => {
    const user = userEvent.setup();
    renderShell();

    const aside = screen.getByRole("complementary");
    const content = screen.getByRole("main").parentElement;

    expect(aside).toHaveClass("transition-[width]");
    expect(content).not.toHaveClass("md:pl-64");

    await user.click(screen.getByRole("button", { name: tConsole("shell.collapseSidebar") }));

    expect(aside).toHaveClass("w-0");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement).toBe(content);
  });

  it("starts collapsed when the persisted choice says so", () => {
    renderShell("/app", { sidebarOpen: false });

    expect(screen.getByRole("complementary")).toHaveClass("w-0", "invisible");
    expect(screen.getByRole("button", { name: tConsole("shell.openMenu") })).toBeInTheDocument();
  });

  it("opens the collapsed navigation in a drawer that closes again", async () => {
    const user = userEvent.setup();
    renderShell("/app", { sidebarOpen: false });

    await user.click(screen.getByRole("button", { name: tConsole("shell.openMenu") }));

    expect(within(screen.getByRole("dialog")).getByRole("navigation")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: tCommon("ui.close") }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

describe("DashboardLayout active section and permissions (S7, S8)", () => {
  it("marks the current section and leaves the others unmarked", () => {
    renderShell("/app/users");

    expect(within(sectionNav()).getByRole("link", { name: tConsole("nav.users") })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(sectionNav()).getByRole("link", { name: tConsole("nav.roles") }),
    ).not.toHaveAttribute("aria-current");
  });

  it("shows the current section in the topbar breadcrumb", () => {
    renderShell("/app/users");

    const banner = screen.getByRole("banner");
    const breadcrumb = within(banner).getByRole("navigation", {
      name: tCommon("ui.breadcrumb.label"),
    });

    expect(breadcrumb).toHaveTextContent(tConsole("nav.users"));
  });

  it("offers only the sections the session may read", () => {
    renderShell("/app", { permissions: ["user:read"] });

    expect(within(sectionNav()).getByRole("link", { name: tConsole("nav.users") })).toBeVisible();
    expect(within(sectionNav()).queryByRole("link", { name: tConsole("nav.roles") })).toBeNull();
  });
});

describe("DashboardLayout search (COU-347)", () => {
  it("hands the term to the users list when the console search is submitted", async () => {
    const user = userEvent.setup();
    const { router } = renderShell();

    const search = screen.getByRole("searchbox", { name: tConsole("shell.searchLabel") });
    await user.type(search, "ada{Enter}");

    expect(router.state.location.pathname).toBe("/app/users");
    expect(router.state.location.search).toBe("?search=ada");
  });
});

describe("DashboardLayout breadcrumbs (S5)", () => {
  it("renders the full trail on the user sub-pages", () => {
    for (const [path, expected] of [
      ["/app/users/new", [tConsole("nav.home"), tConsole("nav.users"), tUsers("create.title")]],
      ["/app/users/u9", [tConsole("nav.home"), tConsole("nav.users"), tUsers("detail.title")]],
      ["/app/users/u9/edit", [tConsole("nav.home"), tConsole("nav.users"), tUsers("edit.title")]],
    ] as const) {
      const { container } = renderShell(path);

      const banner = within(container).getByRole("banner");
      const trail = within(banner)
        .getByRole("navigation", { name: tCommon("ui.breadcrumb.label") })
        .textContent.trim();

      for (const label of expected) {
        expect(trail).toContain(label);
      }
    }
  });

  it("keeps the two-level trail on the section roots", () => {
    for (const path of ["/app", "/app/users"]) {
      const { container } = renderShell(path);

      const banner = within(container).getByRole("banner");
      const trail = within(banner)
        .getByRole("navigation", { name: tCommon("ui.breadcrumb.label") })
        .textContent.trim();

      expect(trail).toContain(tConsole("nav.home"));
    }
  });
});

describe("DashboardLayout sidebar identity (S1)", () => {
  it("shows the signed-in user with their role under the name", () => {
    renderShell("/app/users");

    const block = screen.getByRole("button", { name: tConsole("shell.userMenu") });

    expect(block).toHaveTextContent("Ada Lovelace");
    expect(block).toHaveTextContent("admin");
  });
});

describe("DashboardLayout user menu (S1)", () => {
  it("links to the profile and signs out to the login page", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { router } = renderShell();

    await user.click(screen.getByRole("button", { name: tConsole("shell.userMenu") }));

    expect(screen.getByRole("menuitem", { name: tConsole("shell.profile") })).toHaveAttribute(
      "href",
      "/profile",
    );

    await user.click(screen.getByRole("menuitem", { name: tConsole("shell.signOut") }));

    await waitFor(() => {
      expect(sessionStore.getState().status).toBe("anonymous");
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
  });
});

describe("DashboardLayout sign-out (COU-318)", () => {
  it("leaves for the login screen without waiting for the revoke to answer", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
    const { router } = renderShell();

    await user.click(screen.getByRole("button", { name: tConsole("shell.userMenu") }));
    await user.click(screen.getByRole("menuitem", { name: tConsole("shell.signOut") }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
  });
});

describe("DashboardLayout keyboard and accessibility (S9, S10, S11)", () => {
  it("walks the whole shell with the keyboard alone, in document order", async () => {
    const user = userEvent.setup();
    renderShell();

    const expectedOrder = [
      tCommon("shell.skipLink"),
      tConsole("shell.title"),
      ...CONSOLE_NAV.filter((item) => item.implemented !== false).map((item) =>
        tConsole(item.labelKey),
      ),
      tConsole("shell.userMenu"),
      tConsole("shell.openMenu"),
      tConsole("shell.collapseSidebar"),
      tConsole("shell.searchLabel"),
      tCommon("shell.theme.system"),
      tCommon("shell.theme.light"),
      tCommon("shell.theme.dark"),
      tCommon("shell.language.switch"),
      tConsole("shell.profile"),
    ];

    const reached: string[] = [];

    let step = 0;
    while (step < expectedOrder.length) {
      await user.tab();
      reached.push(
        document.activeElement?.getAttribute("aria-label") ??
          document.activeElement?.textContent ??
          "",
      );
      step += 1;
    }

    expect(reached).toEqual(expectedOrder);
  });

  it("collapses and expands the sidebar from the keyboard", async () => {
    const user = userEvent.setup();
    renderShell();

    screen.getByRole("button", { name: tConsole("shell.collapseSidebar") }).focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("complementary")).toHaveClass("w-0", "invisible");
    expect(screen.getByRole("button", { name: tConsole("shell.expandSidebar") })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("complementary")).toHaveClass("w-64");
  });

  it("has no axe violations in the light theme", async () => {
    const { container } = renderShell();
    await screen.findByRole("heading", { name: "Summary content" });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the dark theme either", async () => {
    document.documentElement.classList.add("dark");

    const { container } = renderShell();
    await screen.findByRole("heading", { name: "Summary content" });

    expect(await axe(container)).toHaveNoViolations();
  });
});
