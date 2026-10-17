// Component tests for the shadcn/ui Skeleton primitive (COU-271, S3-S5).
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders a pulsing placeholder on the muted surface token", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveClass("animate-pulse", "bg-muted");
  });

  it("accepts the caller's dimensions through className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);

    expect(container.firstElementChild).toHaveClass("h-4", "w-32");
  });

  it("stays out of the accessibility tree when the caller hides it", () => {
    const { container } = render(<Skeleton aria-hidden="true" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(<Skeleton />);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Skeleton />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
