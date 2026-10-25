import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { RequireAuth } from "@/features/authorization/components/require-auth";
import { i18n } from "@/lib/i18n";

import { Component as AboutRoute } from "./about-route";
import { router } from "./index";
import { Component as LandingRoute } from "./landing-route";
import { Component as LoginRoute } from "./login-route";

describe("routes", () => {
  it("registers the public layout for the informational pages, and login as a sibling", () => {
    expect(router.routes.map((route) => route.path)).toEqual([
      "/",
      "/login",
      "/app",
      "/forbidden",
      "/profile",
    ]);
    expect(router.routes[0].children?.map((route) => route.path ?? "index")).toEqual([
      "index",
      "about",
    ]);
  });

  it("registers the users section as a lazy console child before the fallback (COU-289)", () => {
    const appRoute = router.routes.find((route) => route.path === "/app");

    expect(
      appRoute?.children?.map((route) => route.path ?? (route.index ? "index" : undefined)),
    ).toEqual(["index", "users", "users/new", "users/:id/edit", "*"]);
  });

  it("registers the create-user route before any dynamic detail or fallback (COU-290)", () => {
    const appRoute = router.routes.find((route) => route.path === "/app");
    const paths = appRoute?.children?.map((route) => route.path ?? undefined) ?? [];

    expect(paths.indexOf("users/new")).toBeGreaterThan(-1);
    expect(paths.indexOf("users/new")).toBeLessThan(paths.indexOf("*"));
  });

  it("registers the edit-user route after users/new and before the fallback (COU-292)", () => {
    const appRoute = router.routes.find((route) => route.path === "/app");
    const paths = appRoute?.children?.map((route) => route.path ?? undefined) ?? [];

    expect(paths.indexOf("users/:id/edit")).toBeGreaterThan(paths.indexOf("users/new"));
    expect(paths.indexOf("users/:id/edit")).toBeLessThan(paths.indexOf("*"));
  });

  it("puts every console route behind the session gate, and none of the public ones", () => {
    const gateOf = (path: string) => {
      const route = router.routes.find((candidate) => candidate.path === path);
      const element = route?.element as { type?: unknown } | undefined;

      return element?.type;
    };

    expect(gateOf("/app")).toBe(RequireAuth);
    expect(gateOf("/forbidden")).toBe(RequireAuth);
    expect(gateOf("/profile")).toBe(RequireAuth);
    expect(gateOf("/")).not.toBe(RequireAuth);
  });

  it("renders the lazy login route component", () => {
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
