import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { selectTheme, uiStore } from "@/stores/use-ui-store";

import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  it("renders the current theme from the store", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: /theme/i });
    expect(toggle).toHaveTextContent("Light");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("aria-label", "Switch to dark theme");
  });

  it("re-renders when the store theme changes", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /theme/i }));

    expect(selectTheme(uiStore.getState())).toBe("dark");
    const toggle = screen.getByRole("button", { name: /theme/i });
    expect(toggle).toHaveTextContent("Dark");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAttribute("aria-label", "Switch to light theme");
  });

  it("follows an external setTheme dispatch", () => {
    render(<ThemeToggle />);
    act(() => {
      uiStore.getState().setTheme("dark");
    });

    const toggle = screen.getByRole("button", { name: /theme/i });
    expect(toggle).toHaveTextContent("Dark");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ThemeToggle />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
