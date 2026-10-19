// Landing page tests (COU-310, T2 / S4, S7, S8).
//
// The informational home explains the project without a session, so it is asserted for
// the content the ticket enumerates (what it is, the service, features, quickstart,
// stack, links) and for what it must never do: call the API.
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";
import { docsUrl, repositoryUrl } from "@/lib/links";

import { LandingPage } from "./landing-page";

const t = i18n.getFixedT(null, "landing");

describe("landing page", () => {
  it("has a single level-1 heading with the project title", () => {
    render(<LandingPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t("title"));
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
    // The command is code, not copy: it must not be translated.
    expect(screen.getByText(t("quickstart.command"))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("stack.title") })).toBeInTheDocument();
    expect(screen.getByText(t("stack.body"))).toBeInTheDocument();
    expect(screen.getByText("React 19")).toBeInTheDocument();
  });

  it("sends the visitor to the repository and the docs from the hero", () => {
    render(<LandingPage />);

    expect(screen.getByRole("link", { name: t("hero.ctaRepository") })).toHaveAttribute(
      "href",
      repositoryUrl,
    );
    expect(screen.getByRole("link", { name: t("hero.ctaDocs") })).toHaveAttribute("href", docsUrl);
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
