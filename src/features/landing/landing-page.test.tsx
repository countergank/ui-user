import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

import { LandingPage } from "./landing-page";

const t = i18n.getFixedT(null, "landing");

describe("landing page", () => {
  it("has a single level-1 heading with the artboard headline", () => {
    render(<LandingPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t("hero.headline"));
  });

  it("explains what the project is and what service it provides", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: t("what.title") })).toBeInTheDocument();
    expect(screen.getByText(t("what.body"))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("service.title") })).toBeInTheDocument();
    expect(screen.getByText(t("service.body"))).toBeInTheDocument();
  });

  it("lists the features with their descriptions", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: t("features.title") })).toBeInTheDocument();
    for (const item of ["session", "accessibility", "languages", "typed"] as const) {
      expect(
        screen.getByRole("heading", { name: t(`features.items.${item}.title`) }),
      ).toBeInTheDocument();
      expect(screen.getByText(t(`features.items.${item}.description`))).toBeInTheDocument();
    }
  });

  it("shows the quickstart command and the stack", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: t("quickstart.title") })).toBeInTheDocument();
    expect(screen.getByText(t("quickstart.body"))).toBeInTheDocument();
    expect(screen.getByText(t("quickstart.command"))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("stack.title") })).toBeInTheDocument();
    expect(screen.getByText(t("stack.body"))).toBeInTheDocument();
    expect(screen.getByText("React 19")).toBeInTheDocument();
  });

  it("points the hero CTA at the capabilities section and shows the chips", () => {
    render(<LandingPage />);

    expect(screen.getByRole("link", { name: t("hero.ctaCapabilities") })).toHaveAttribute(
      "href",
      "#capacidades",
    );
    for (const chip of ["jwt", "rbac", "audit"] as const) {
      expect(screen.getByText(t(`hero.chips.${chip}`))).toBeInTheDocument();
    }
  });

  it("renders the product mock as decorative proof", () => {
    const { container } = render(<LandingPage />);

    const preview = container.querySelector('[data-testid="product-preview"]');
    expect(preview).toHaveAttribute("aria-hidden", "true");
    expect(preview).toHaveTextContent(t("mock.sidebar.users"));
    expect(preview).toHaveTextContent(t("mock.search.placeholder"));
    expect(preview).toHaveTextContent(t("mock.actions.newUser"));
    expect(preview).toHaveTextContent(t("mock.users.leandro.name"));
    expect(preview).toHaveTextContent(t("mock.users.diego.name"));
  });

  it("never calls the API from a public surface", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(<LandingPage />);

    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("has no axe violations", async () => {
    const { container } = render(<LandingPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
