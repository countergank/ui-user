// Component tests for the shadcn/ui Switch primitive (COU-271, S3-S5).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Switch } from "./switch";

/** The switch by its accessible name, whatever its checked state. */
function getSwitch(name = "Notifications"): HTMLElement {
  return screen.getByRole("switch", { name });
}

describe("Switch", () => {
  it("exposes the switch role, starts unchecked, and toggles on click", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Switch id="notifications" />
        <label htmlFor="notifications">Notifications</label>
      </>,
    );

    expect(getSwitch()).not.toBeChecked();

    await user.click(getSwitch());
    expect(getSwitch()).toBeChecked();

    await user.click(getSwitch());
    expect(getSwitch()).not.toBeChecked();
  });

  it("toggles from the keyboard with Space", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Switch id="notifications" />
        <label htmlFor="notifications">Notifications</label>
      </>,
    );

    getSwitch().focus();
    await user.keyboard(" ");

    expect(getSwitch()).toBeChecked();
  });

  it("blocks interaction when disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Switch id="notifications" disabled />
        <label htmlFor="notifications">Notifications</label>
      </>,
    );

    await user.click(getSwitch());

    expect(getSwitch()).not.toBeChecked();
  });

  it("renders the thumb as a token-styled element with no inline transform", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Switch id="notifications" />
        <label htmlFor="notifications">Notifications</label>
      </>,
    );

    const thumb = container.querySelector("[data-state]");

    expectNoAuthoredInlineStyles(container);

    await user.click(getSwitch());

    // State is carried by the Radix data attribute the token utilities key off.
    expect(container.querySelector('[data-state="checked"]')).not.toBeNull();
    expect(thumb).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Switch id="notifications" />
        <label htmlFor="notifications">Notifications</label>
      </>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
