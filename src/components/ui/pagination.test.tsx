// Component tests for the shadcn/ui Pagination primitives (COU-271, S2-S5, S7).
import { render, screen } from "@testing-library/react";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { createI18nInstance } from "@/lib/i18n";
import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

/** A real pager: previous, first page (current), second page, collapsed gap, next. */
function renderPagination(instance: I18nInstance = createI18nInstance({ lng: "en" })) {
  return render(
    <I18nextProvider i18n={instance}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/members?page=1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/members?page=1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/members?page=2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="/members?page=3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </I18nextProvider>,
  );
}

describe("Pagination", () => {
  it("is a labelled navigation landmark that reaches every page control", () => {
    renderPagination();

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/members?page=1");
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/members?page=2");
  });

  it("labels the previous and next controls from the translation bundle", () => {
    renderPagination();

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/members?page=1",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/members?page=3");
  });

  it("ships the previous and next labels in Spanish too — parity, not an English hardcode", () => {
    renderPagination(createI18nInstance({ lng: "es" }));

    expect(screen.getByRole("navigation", { name: "Paginación" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Anterior" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Siguiente" })).toBeInTheDocument();
  });

  it("announces the collapsed pages instead of leaving three silent dots", () => {
    renderPagination();

    expect(screen.getByText("More pages")).toBeInTheDocument();
  });

  it("marks only the active page with aria-current", () => {
    renderPagination();

    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "2" })).not.toHaveAttribute("aria-current");
  });

  it("styles page numbers with the shared button classes rather than its own", () => {
    renderPagination();

    // `inline-flex` and `bg-background` only exist in `buttonVariants`: the active page is
    // the outline variant, the other one the ghost variant of the same button.
    expect(screen.getByRole("link", { name: "1" })).toHaveClass("inline-flex", "bg-background");
    expect(screen.getByRole("link", { name: "2" })).toHaveClass("inline-flex");
    expect(screen.getByRole("link", { name: "2" })).not.toHaveClass("bg-background");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = renderPagination();

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = renderPagination();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
