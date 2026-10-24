import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its text as non-interactive content, not a button", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["default", "bg-primary"],
    ["secondary", "bg-secondary"],
    ["destructive", "bg-destructive"],
    ["outline", "text-foreground"],
  ] as const)("maps the %s variant to its design token", (variant, tokenClass) => {
    render(<Badge variant={variant}>Active</Badge>);

    expect(screen.getByText("Active")).toHaveClass(tokenClass);
  });

  it("defaults to the primary variant when none is given", () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByText("Active")).toHaveClass("bg-primary");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(<Badge>Active</Badge>);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
