// Component tests for the shadcn/ui Popover primitives (COU-271, S2-S5).
//
// A popover is a non-modal dialog anchored to its trigger. Radix owns the anchoring and
// the dismissal rules, so the tests below pin the observable contract: closed until
// asked, named when open, dismissable with Escape, tokens-only, axe-clean.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function renderPopover() {
  return render(
    <Popover>
      <PopoverTrigger>Open filters</PopoverTrigger>
      <PopoverContent aria-label="Member filters">
        <p>Filter the member list by role.</p>
      </PopoverContent>
    </Popover>,
  );
}

async function openPopover(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open filters" }));

  return screen.findByRole("dialog", { name: "Member filters" });
}

describe("Popover", () => {
  it("keeps the panel out of the DOM, and the trigger collapsed, until it is opened", () => {
    renderPopover();

    const trigger = screen.getByRole("button", { name: "Open filters" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on trigger click as a dialog named by the caller", async () => {
    const user = userEvent.setup();
    renderPopover();

    const panel = await openPopover(user);

    expect(panel).toHaveTextContent("Filter the member list by role.");
    expect(panel).toHaveAttribute("data-state", "open");
    expect(screen.getByRole("button", { name: "Open filters" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderPopover();
    await openPopover(user);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("renders no inline styles on the elements it authors (S4)", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderPopover();
    await openPopover(user);

    expectNoAuthoredInlineStyles(baseElement);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderPopover();
    await openPopover(user);

    const results = await axe(document.body, { rules: { region: { enabled: false } } });

    expect(results).toHaveNoViolations();
  });
});
