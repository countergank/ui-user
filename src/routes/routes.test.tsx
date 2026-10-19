// Route module coverage (STACK-7, ARCH-5): the data router is constructed at
// module scope and each lazy route module exports a renderable `Component`.
// Copy assertions are derived from the i18n resources (COU-253).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { Component as AboutRoute } from "./about-route";
import { router } from "./index";
import { Component as LandingRoute } from "./landing-route";
import { Component as LoginRoute } from "./login-route";

describe("routes", () => {
  it("registers the public layout for the informational pages, and login as a sibling", () => {
    // ADR-13: `/` and `/about` are the public site; `/login` keeps its own layout
    // because a gate with site chrome above it is not what COU-281 approved.
    expect(router.routes.map((route) => route.path)).toEqual(["/", "/login"]);
    expect(router.routes[0].children?.map((route) => route.path ?? "index")).toEqual([
      "index",
      "about",
    ]);
  });

  it("renders the lazy login route component", () => {
    // The page embeds the login form: a query client and a router for its link.
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      i18n.getFixedT(null, "auth")("login.title"),
    );
  });

  it("renders the lazy landing route component outside the console shell", () => {
    render(
      <MemoryRouter>
        <LandingRoute />
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(i18n.getFixedT(null, "landing")("title"));
    expect(screen.queryByRole("navigation", { name: i18n.t("shell.navigation.main") })).toBeNull();
  });

  it("renders the lazy about route component as a project page", () => {
    const tLanding = i18n.getFixedT(null, "landing");

    render(<AboutRoute />);

    expect(screen.getByRole("heading", { level: 1, name: tLanding("about.title") })).toBeVisible();
    expect(screen.getByText(tLanding("about.body"))).toBeVisible();
  });

  it("links the about page to the standards it follows", () => {
    const tLanding = i18n.getFixedT(null, "landing");

    render(<AboutRoute />);

    for (const [key, file] of [
      ["adr", "adr.md"],
      ["patterns", "component-patterns.md"],
      ["accessibility", "accessibility.md"],
      ["testing", "testing.md"],
    ] as const) {
      expect(
        screen.getByRole("link", { name: tLanding(`about.standards.${key}`) }),
      ).toHaveAttribute("href", expect.stringContaining(`/docs/${file}`));
    }
  });
});
