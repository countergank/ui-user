// Component tests for the shadcn/ui Textarea primitive (COU-271, S3-S5).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("accepts multi-line text through the textbox role", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" />
      </>,
    );

    const textarea = screen.getByLabelText("Notes");
    expect(textarea.tagName).toBe("TEXTAREA");

    await user.type(textarea, "first line{enter}second line");

    expect(textarea).toHaveValue("first line\nsecond line");
  });

  it("blocks interaction when disabled", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" disabled />);

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea).toBeDisabled();
    await user.type(textarea, "nope");

    expect(textarea).toHaveValue("");
  });

  it("renders no inline styles — every visual decision is a token utility (S4)", () => {
    const { container } = render(<Textarea aria-label="Notes" />);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Textarea aria-label="Notes" />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
