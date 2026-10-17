// Component tests for the shadcn/ui Tabs primitives (COU-271, S2-S5).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

/** A two-section tab set: the smallest structure that can prove one panel is swapped out. */
function renderTabs() {
  return render(
    <Tabs defaultValue="profile">
      <TabsList aria-label="Account sections">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">Profile details.</TabsContent>
      <TabsContent value="sessions">Active sessions for this account.</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("exposes a named tab list with one selected tab and its panel", () => {
    renderTabs();

    expect(screen.getByRole("tablist", { name: "Account sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Sessions" })).toHaveAttribute("aria-selected", "false");
    // Only the selected panel exists: the inactive one is not merely hidden from view.
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Profile details.");
  });

  it("switches the visible panel when another tab is clicked", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: "Sessions" }));

    expect(screen.getByRole("tab", { name: "Sessions" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Active sessions for this account.");
    expect(screen.queryByText("Profile details.")).not.toBeInTheDocument();
  });

  it("moves the selection with the arrow keys once a tab has focus", async () => {
    const user = userEvent.setup();
    renderTabs();

    // A single Tab stop: the selected tab, not every tab in the list.
    await user.tab();
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Sessions" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Active sessions for this account.");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = renderTabs();

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = renderTabs();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
