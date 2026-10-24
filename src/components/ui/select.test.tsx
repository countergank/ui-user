// Component tests for the shadcn/ui Select primitives (COU-271, S3-S5).
//
// Radix Select opens through pointer events jsdom cannot fully model (`scrollIntoView`,
// pointer capture), so this suite pins what the ticket asks for — render, accessible
// name, disabled contract and axe — instead of faking an interaction the browser owns.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

function renderSelect(disabled = false) {
  return render(
    <>
      <label htmlFor="role">Role</label>
      <Select disabled={disabled}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Pick a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </>,
  );
}

describe("Select", () => {
  it("renders a collapsed combobox with the trigger's accessible name and placeholder", () => {
    renderSelect();

    const trigger = screen.getByRole("combobox", { name: "Role" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Pick a role");
  });

  it("keeps the listbox out of the DOM until the trigger is activated", () => {
    renderSelect();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks the trigger disabled and non-expandable when the select is disabled", () => {
    renderSelect(true);

    const trigger = screen.getByRole("combobox", { name: "Role" });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = renderSelect();

    expectNoAuthoredInlineStyles(container);
    expect(screen.getByRole("combobox", { name: "Role" })).not.toHaveAttribute("style");
  });

  it("has no axe violations", async () => {
    const { container } = renderSelect();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
