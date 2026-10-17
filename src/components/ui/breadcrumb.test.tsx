// Component tests for the shadcn/ui Breadcrumb primitives (COU-271, S2-S5, S7).
import { render, screen } from "@testing-library/react";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { createI18nInstance } from "@/lib/i18n";
import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

/** A real trail: one ancestor link, collapsed segments, and the current page. */
function renderBreadcrumb(instance: I18nInstance = createI18nInstance({ lng: "en" })) {
  return render(
    <I18nextProvider i18n={instance}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/members">Members</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ada Lovelace</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </I18nextProvider>,
  );
}

describe("Breadcrumb", () => {
  it("is a labelled navigation landmark linking back to the ancestor", () => {
    renderBreadcrumb();

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Members" })).toHaveAttribute("href", "/members");
  });

  it("announces the current page without making it a dead link", () => {
    renderBreadcrumb();

    const currentPage = screen.getByText("Ada Lovelace");

    expect(currentPage).toHaveAttribute("aria-current", "page");
    // Text, not an anchor: the crumb names where the user already is, so there is no
    // focusable no-op link to tab through.
    expect(currentPage.tagName).toBe("SPAN");
    expect(currentPage).not.toHaveAttribute("href");
  });

  it("keeps the separators out of the accessibility tree", () => {
    const { container } = renderBreadcrumb();

    const separators = container.querySelectorAll("li[role='presentation']");

    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("labels the collapsed segments from the translation bundle", () => {
    renderBreadcrumb();

    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("ships the collapsed-segment label in Spanish too — parity, not an English hardcode", () => {
    renderBreadcrumb(createI18nInstance({ lng: "es" }));

    expect(screen.getByRole("navigation", { name: "Ruta de navegación" })).toBeInTheDocument();

    expect(screen.getByText("Más")).toBeInTheDocument();
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = renderBreadcrumb();

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = renderBreadcrumb();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
