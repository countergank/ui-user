import { act, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Toaster } from "./sonner";

describe("Toaster", () => {
  it("renders nothing until a toast is raised", () => {
    render(<Toaster />);

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("surfaces a raised toast to the user", async () => {
    render(<Toaster />);

    act(() => {
      toast("Member saved");
    });

    expect(await screen.findByText("Member saved")).toBeInTheDocument();
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(<Toaster />);

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Toaster />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
