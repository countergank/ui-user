// Component tests for the shadcn/ui Tooltip primitives (COU-271, S2-S5).
//
// A tooltip must be reachable without a mouse, so the open test drives it with the
// keyboard: Tab focuses the trigger and Radix opens the description. Radix provides
// the trigger/content wiring; these tests pin the contract around it.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

/** A tooltip whose trigger is a real button, the only interactive shape it supports. */
function renderTooltip() {
  return render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Archive member</TooltipTrigger>
        <TooltipContent>Members can rejoin with an invite link.</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
}

describe("Tooltip", () => {
  it("renders a trigger that describes nothing until the tooltip is invoked", () => {
    renderTooltip();

    const trigger = screen.getByRole("button", { name: "Archive member" });

    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(trigger).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on keyboard focus and describes the trigger with its content", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    const trigger = screen.getByRole("button", { name: "Archive member" });

    expect(trigger).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Members can rejoin with an invite link.",
    );
    // The description is attached to the trigger, which is what a screen reader reads
    // once the tooltip opens.
    expect(trigger).toHaveAccessibleDescription("Members can rejoin with an invite link.");
  });

  it("closes again when the trigger loses focus", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    await screen.findByRole("tooltip");

    await user.tab();

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("renders no inline styles on the elements it authors (S4)", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderTooltip();
    await user.tab();
    await screen.findByRole("tooltip");

    expectNoAuthoredInlineStyles(baseElement);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    await screen.findByRole("tooltip");

    // `region` is a page-level rule, and a floating layer portaled to <body> can never sit
    // inside a landmark on a bare test page; the flagged node is Radix's own wrapper, not
    // markup this primitive authors, so that one rule is skipped while the rest run.
    const results = await axe(document.body, { rules: { region: { enabled: false } } });

    expect(results).toHaveNoViolations();
  });
});
