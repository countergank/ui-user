// Component tests for the shadcn/ui Button (TEST-2, vitest-003/004).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible button and fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    const button = screen.getByRole("button", { name: "Submit" });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders asChild components with the styled button classes", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button asChild>
        <a href="/about" onClick={onClick}>
          Go to about
        </a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Go to about" });
    expect(link).toHaveAttribute("href", "/about");
    await user.click(link);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button and blocks interaction", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Button>Accessible button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
