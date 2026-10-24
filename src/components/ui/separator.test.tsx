// Component tests for the shadcn/ui Separator primitive (COU-271, S2-S5).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Separator } from "./separator";

describe("Separator", () => {
  it("exposes the separator role horizontally by default", () => {
    render(<Separator />);

    const separator = screen.getByRole("separator");

    expect(separator).not.toHaveAttribute("aria-orientation");
    expect(separator).toHaveClass("h-[1px]", "w-full");
  });

  it("switches to the vertical orientation contract", () => {
    render(<Separator orientation="vertical" />);

    const separator = screen.getByRole("separator");

    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveClass("h-full", "w-[1px]");
  });

  it("drops the separator role when it is purely decorative", () => {
    render(<Separator decorative />);

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(<Separator />);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Separator />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
