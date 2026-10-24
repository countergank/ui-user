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
          { path: "users", Component: () => <h1>Users content</h1> },
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
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("keeps the skip link as the first focusable element, pointing at main", () => {
    renderShell();

    const skip = screen.getByRole("link", { name: tCommon("shell.skipLink") });

    expect(skip).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("keeps the theme switcher and adds the language control in the topbar", () => {
    renderShell();

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole("button", {
        name: tCommon("shell.theme.switchTo", { mode: tCommon("shell.theme.light") }),
      }),
    ).toBeInTheDocument();
    expect(
      within(header).getByRole("button", { name: tCommon("shell.language.switch") }),
    ).toBeInTheDocument();
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
      within(sectionNav()).getByRole("link", { name: tConsole("nav.summary") }),
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
      ...CONSOLE_NAV.map((item) => tConsole(item.labelKey)),
      tConsole("shell.openMenu"),
      tConsole("shell.collapseSidebar"),
      tConsole("shell.title"),
      tCommon("shell.language.switch"),
      tCommon("shell.theme.switchTo", { mode: tCommon("shell.theme.light") }),
      tConsole("shell.userMenu"),
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
