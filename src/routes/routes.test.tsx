// Route module coverage (STACK-7, ARCH-5): the data router is constructed at
// module scope and each lazy route module exports a renderable `Component`.
// Copy assertions are derived from the i18n resources (COU-253).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { Component as AboutRoute } from "./about-route";
import { Component as HomeRoute } from "./home-route";
import { router } from "./index";

describe("routes", () => {
  it("exports a browser router with an app shell root and two child routes", () => {
    const first = router.routes[0];
    expect(first.path).toBe("/");
    expect(first.children).toHaveLength(2);
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
