import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

import { LandingPage } from "./landing-page";

const t = i18n.getFixedT(null, "landing");

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe("landing page", () => {
  it("has a single level-1 heading with the artboard headline", () => {
    renderPage();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t("hero.headline"));
  });

  it("presents the six capability blocks under the capabilities section", () => {
    const { container } = renderPage();

    expect(container.querySelector("#capacidades")).not.toBeNull();
    expect(screen.getByRole("heading", { name: t("capabilities.heading") })).toBeInTheDocument();
    expect(screen.getByText(t("capabilities.lead"))).toBeInTheDocument();
    for (const item of ["rbac", "audit", "sessions", "email", "i18n", "params"] as const) {
      expect(
        screen.getByRole("heading", { name: t(`capabilities.items.${item}.title`) }),
      ).toBeInTheDocument();
      expect(screen.getByText(t(`capabilities.items.${item}.description`))).toBeInTheDocument();
    }
  });

  it("presents the security section with its three items", () => {
    const { container } = renderPage();

    expect(container.querySelector("#seguridad")).not.toBeNull();
    expect(screen.getByRole("heading", { name: t("security.heading") })).toBeInTheDocument();
    for (const item of ["jwt", "lockout", "emailChange"] as const) {
      expect(
        screen.getByRole("heading", { name: t(`security.items.${item}.title`) }),
      ).toBeInTheDocument();
      expect(screen.getByText(t(`security.items.${item}.description`))).toBeInTheDocument();
    }
  });

  it("closes with a CTA that links to the login route", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: t("cta.heading") })).toBeInTheDocument();
    expect(screen.getByText(t("cta.lead"))).toBeInTheDocument();
    const loginLinks = screen.getAllByRole("link", { name: t("nav.signIn") });
    expect(loginLinks).toHaveLength(2);
    for (const link of loginLinks) expect(link).toHaveAttribute("href", "/login");
  });

  it("points the hero CTA at the capabilities section and shows the chips", () => {
    renderPage();

    expect(screen.getByRole("link", { name: t("hero.ctaCapabilities") })).toHaveAttribute(
      "href",
      "#capacidades",
    );
    for (const chip of ["jwt", "rbac", "audit"] as const) {
      expect(screen.getAllByText(t(`hero.chips.${chip}`)).length).toBeGreaterThan(0);
    }
  });

  it("renders the product mock as decorative proof", () => {
    const { container } = renderPage();

    const preview = container.querySelector('[data-testid="product-preview"]');
    expect(preview).toHaveAttribute("aria-hidden", "true");
    expect(preview).toHaveTextContent(t("mock.sidebar.users"));
    expect(preview).toHaveTextContent(t("mock.search.placeholder"));
    expect(preview).toHaveTextContent(t("mock.actions.newUser"));
    expect(preview).toHaveTextContent(t("mock.users.ana.name"));
    expect(preview).toHaveTextContent(t("mock.users.diego.name"));
  });

  it("never calls the API from a public surface", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderPage();

    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("has no axe violations", async () => {
    const { container } = renderPage();

    expect(await axe(container)).toHaveNoViolations();
  });
});
