// Component tests for the shadcn/ui ScrollArea primitives (COU-271, S2-S5).
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { ScrollArea, ScrollBar } from "./scroll-area";

function renderScrollArea() {
  return render(
    <ScrollArea type="always" className="h-40 w-60">
      <ul>
        <li>Ada Lovelace</li>
        <li>Grace Hopper</li>
      </ul>
    </ScrollArea>,
  );
}

describe("ScrollArea", () => {
  it("renders its viewport around the content the caller passed", () => {
    const { container } = renderScrollArea();

    const viewport = container.querySelector("[data-radix-scroll-area-viewport]");

    expect(viewport).not.toBeNull();
    expect(within(viewport as HTMLElement).getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("mounts a vertical scrollbar styled from the border token", () => {
    const { container } = renderScrollArea();

    const scrollbar = container.querySelector("[data-orientation='vertical']");

    expect(scrollbar).not.toBeNull();
    expect(scrollbar).toHaveClass("w-2.5", "border-l");
  });

  it("maps the horizontal orientation to its own bar layout", () => {
    const { container } = render(
      <ScrollArea type="always">
        <p>Wide content</p>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    );

    expect(container.querySelector("[data-orientation='horizontal']")).toHaveClass(
      "h-2.5",
      "flex-col",
    );
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = renderScrollArea();

    // Radix owns the `overflow`/`position`/`min-width` mechanics it sets inline; the guard
    // only refuses design properties (colour, type, spacing).
    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = renderScrollArea();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
