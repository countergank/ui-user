// Component tests for the shadcn/ui Input primitive (COU-271, S3-S5).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Input } from "./input";

describe("Input", () => {
  it("takes its accessible name from the associated label and accepts typing", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label htmlFor="email">Email</label>
        <Input id="email" />
      </>,
    );

    const input = screen.getByLabelText("Email");
    await user.type(input, "user@example.com");

    expect(input).toHaveValue("user@example.com");
  });

  it("blocks interaction when disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label htmlFor="email">Email</label>
        <Input id="email" disabled />
      </>,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeDisabled();
    await user.type(input, "nope");

    expect(input).toHaveValue("");
  });

  it("renders no inline styles — every visual decision is a token utility (S4)", () => {
    const { container } = render(<Input aria-label="Search" />);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Input aria-label="Search" />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
