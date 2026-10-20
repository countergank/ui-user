// Console navigation suite (COU-275, T4 / S3, S4).
//
// The ticket's acceptance case lives here: a `user:read` visitor sees Users and nothing
// else that needs a permission they do not hold, while `admin` (`*`) sees the whole
// console. Assertions are on what a person can reach — links by accessible name — so a
// hidden section cannot pass by being styled away.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { ConsoleNav } from "./console-nav";

const t = i18n.getFixedT(null, "console");

function renderNav(permissions: string[]) {
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: "user@example.com",
      userName: "user",
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
    email: "user@example.com",
    role: "user",
    permissions,
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/app"]}>
        <ConsoleNav />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** The section names the navigation currently offers. */
function visibleSectionNames(): string[] {
  const nav = screen.getByRole("navigation", { name: t("nav.label") });

  return within(nav)
    .queryAllByRole("link")
    .map((link) => link.textContent)
    .sort();
}

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

describe("ConsoleNav", () => {
  it("offers only the sections whose permission the user holds", () => {
    renderNav(["user:read"]);

    expect(visibleSectionNames()).toEqual([t("nav.summary"), t("nav.users")].sort());
  });

  it("hides roles and audit from a user who only reads users", () => {
    renderNav(["user:read"]);

    expect(screen.queryByRole("link", { name: t("nav.roles") })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: t("nav.audit") })).not.toBeInTheDocument();
  });

  it("offers every section to the wildcard", async () => {
    const { container } = renderNav(["*"]);

    expect(visibleSectionNames()).toEqual(
      [
        t("nav.summary"),
        t("nav.users"),
        t("nav.roles"),
        t("nav.permissions"),
        t("nav.audit"),
        t("nav.settings"),
      ].sort(),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
