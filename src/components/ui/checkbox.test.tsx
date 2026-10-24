// Component tests for the shadcn/ui Checkbox primitive (COU-271, S3-S5).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Checkbox } from "./checkbox";

function getCheckbox(name = "Accept terms"): HTMLElement {
  return screen.getByRole("checkbox", { name });
}

describe("Checkbox", () => {
  it("starts unchecked, toggles on click, and reports state through aria-checked", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );

    expect(getCheckbox()).not.toBeChecked();

    await user.click(getCheckbox());
    expect(getCheckbox()).toBeChecked();

    await user.click(getCheckbox());
    expect(getCheckbox()).not.toBeChecked();
  });

  it("toggles from the keyboard with Space, because it is a real checkbox role", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );

    getCheckbox().focus();
    await user.keyboard(" ");

    expect(getCheckbox()).toBeChecked();
  });

  it("blocks interaction when disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox id="terms" disabled />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );

    await user.click(getCheckbox());

    expect(getCheckbox()).not.toBeChecked();
  });

  it("renders the check indicator only when checked, hidden from assistive tech", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );

    expect(container.querySelector("svg")).toBeNull();

    await user.click(getCheckbox());

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no inline styles — every visual decision is a token utility (S4)", () => {
    const { container } = render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
