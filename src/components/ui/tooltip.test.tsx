import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

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

    const results = await axe(document.body, { rules: { region: { enabled: false } } });

    expect(results).toHaveNoViolations();
  });
});
