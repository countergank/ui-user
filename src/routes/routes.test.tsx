// Route module coverage (STACK-7, ARCH-5): the data router is constructed at
// module scope and each lazy route module exports a renderable `Component`.
// Copy assertions are derived from the i18n resources (COU-253).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { Component as AboutRoute } from "./about-route";
import { Component as HomeRoute } from "./home-route";
import { router } from "./index";
import { Component as LoginRoute } from "./login-route";

describe("routes", () => {
  it("registers the app shell and the login page as sibling top-level routes", () => {
    expect(router.routes.map((route) => route.path)).toEqual(["/", "/login"]);
    // The login gate has neither the shell's navigation nor its skip link, so it cannot
    // be a child of the shell route.
    expect(router.routes[0].children).toHaveLength(2);
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

  it("renders the lazy home route component", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <HomeRoute />
      </QueryClientProvider>,
    );

    // The hero title interpolates a time-based greeting; assert the resource's
    // static portion so the expectation stays derived from translations.
    const heroTitleTail = i18n.t("home.hero.title", { greeting: "" }).replace(/^!\s*/, "");
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(heroTitleTail);
  });

  it("renders the lazy about route component", () => {
    render(<AboutRoute />);
    expect(screen.getByRole("heading", { name: i18n.t("about.heading") })).toBeInTheDocument();
    expect(screen.getByText(i18n.t("about.title"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("about.description"))).toBeInTheDocument();
  });
});
