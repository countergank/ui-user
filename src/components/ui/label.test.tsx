// Component tests for the shadcn/ui Label primitive (COU-271, S3-S5).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Label } from "./label";

describe("Label", () => {
  it("associates with its control so the control takes the label as its accessible name", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("keeps the `for` attribute that makes the association explicit", () => {
    render(<Label htmlFor="email">Email</Label>);

    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });

  it("associates implicitly when it wraps the control, without a `for` attribute", () => {
    render(
      <Label>
        Email
        <input />
      </Label>,
    );

    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("never emits `disabled` on the label element — that is not a valid label attribute", () => {
    render(<Label htmlFor="email">Email</Label>);

    expect(screen.getByText("Email")).not.toHaveAttribute("disabled");
  });

  it("renders no inline styles — every visual decision is a token utility (S4)", () => {
    const { container } = render(<Label htmlFor="email">Email</Label>);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Label htmlFor="email">Email</Label>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
