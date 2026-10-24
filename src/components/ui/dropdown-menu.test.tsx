// Component tests for the shadcn/ui DropdownMenu primitives (COU-271, S2-S5). Radix owns
// the open/close lifecycle, so these tests pin the parts the ticket owns: the collapsed
// trigger contract, the semantic slots, and the repo rules invisible to a screenshot.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function renderMenu() {
  return render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Rename
          <DropdownMenuShortcut>Ctrl R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Archive</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked onCheckedChange={() => undefined}>
          Pin to top
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="member" onValueChange={() => undefined}>
          <DropdownMenuRadioItem value="member">Member</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="guest">Guest</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open actions" }));

  return screen.findByRole("menu");
}

describe("DropdownMenu", () => {
  it("stays collapsed and keeps the items out of the DOM until the trigger is activated", () => {
    renderMenu();

    const trigger = screen.getByRole("button", { name: "Open actions" });

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("opens on trigger click and exposes every slot with its own ARIA role", async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole("button", { name: "Open actions" });
    const menu = await openMenu(user);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(menu).toHaveTextContent("Workspace");
    expect(screen.getByRole("menuitem", { name: /Rename/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: "Pin to top" })).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: "Member" })).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: "Guest" })).not.toBeChecked();
    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });

  it("exposes a disabled item as disabled instead of silently dropping it", async () => {
    const user = userEvent.setup();
    renderMenu();
    await openMenu(user);

    const archive = screen.getByRole("menuitem", { name: "Archive" });

    expect(archive).toHaveAttribute("aria-disabled", "true");
    expect(archive).toHaveAttribute("data-disabled", "");
  });

  it("indents items and labels through the same inset variant axis", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Workspace</DropdownMenuLabel>
          <DropdownMenuItem inset>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Open actions" }));

    expect(await screen.findByRole("menuitem", { name: "Rename" })).toHaveClass("pl-8");
    expect(screen.getByText("Workspace")).toHaveClass("pl-8");
  });

  it("renders no inline styles on the elements it authors (S4)", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderMenu();
    await openMenu(user);

    expectNoAuthoredInlineStyles(baseElement);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderMenu();
    await openMenu(user);

    const results = await axe(document.body, { rules: { region: { enabled: false } } });

    expect(results).toHaveNoViolations();
  });
});
