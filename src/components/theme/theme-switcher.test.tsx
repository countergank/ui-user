import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { createI18nInstance } from "@/lib/i18n";
import { uiStore } from "@/stores/use-ui-store";
import { matchMediaStub } from "@/test/setup";

import { ThemeSwitcher } from "./theme-switcher";

function renderSwitcher(language: "en" | "es" | "pt" = "en") {
  const i18n = createI18nInstance({ lng: language });
  const view = render(
    <I18nextProvider i18n={i18n}>
      <ThemeSwitcher />
    </I18nextProvider>,
  );

  return { ...view, i18n };
}

function getThemeButton(): HTMLElement {
  return screen.getByRole("button");
}

function getThemeIcon(): SVGElement {
  const icon = getThemeButton().querySelector("svg");

  if (icon === null) {
    throw new Error("The theme button must render a lucide icon");
  }

  return icon;
}

function setStoredPreference(preference: "light" | "dark" | "system"): void {
  act(() => {
    uiStore.getState().setTheme(preference);
  });
}

describe("ThemeSwitcher", () => {
  it("renders exactly one button — no segmented control, no toggle group", () => {
    renderSwitcher();

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("drops the deleted control's ARIA state (no aria-pressed, no aria-checked)", () => {
    renderSwitcher();

    expect(getThemeButton()).not.toHaveAttribute("aria-pressed");
    expect(getThemeButton()).not.toHaveAttribute("aria-checked");
  });

  it("names the NEXT preference as an action and mirrors it in the tooltip", () => {
    renderSwitcher();

    expect(getThemeButton()).toHaveAccessibleName("Switch to Light");
    expect(getThemeButton()).toHaveAttribute("title", "Switch to Light");
  });

  it("cycles light → dark → system → light with wrap-around, and renames the action each time", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(getThemeButton());
    expect(uiStore.getState().theme).toBe("light");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Dark");

    await user.click(getThemeButton());
    expect(uiStore.getState().theme).toBe("dark");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Automatic");

    await user.click(getThemeButton());
    expect(uiStore.getState().theme).toBe("system");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Light");
  });

  it.each([
    ["light", "lucide-sun", "circle"],
    ["dark", "lucide-moon", "path"],
    ["system", "lucide-monitor", "rect"],
  ] as const)(
    "renders exactly one icon for the %s preference",
    (preference, iconClass, shapeTag) => {
      renderSwitcher();
      setStoredPreference(preference);

      const button = getThemeButton();

      expect(button.querySelectorAll("svg")).toHaveLength(1);
      expect(getThemeIcon()).toHaveClass(iconClass);
      expect(getThemeIcon().querySelector(shapeTag)).not.toBeNull();
    },
  );

  it("hides the icon from assistive tech so it cannot pollute the accessible name", () => {
    renderSwitcher();

    expect(getThemeIcon()).toHaveAttribute("aria-hidden", "true");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Light");
  });

  it("tracks the stored preference instead of a local copy", () => {
    renderSwitcher();

    expect(getThemeIcon()).toHaveClass("lucide-monitor");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Light");

    setStoredPreference("dark");

    expect(getThemeIcon()).toHaveClass("lucide-moon");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Automatic");

    setStoredPreference("light");

    expect(getThemeIcon()).toHaveClass("lucide-sun");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Dark");
  });

  it("keeps showing the preference while the OS goes dark (never the resolved theme)", () => {
    renderSwitcher();

    matchMediaStub.setDark(true);

    expect(getThemeIcon()).toHaveClass("lucide-monitor");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Light");
  });

  it("is keyboard operable: Tab reaches the button, Space and Enter activate it", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.tab();
    expect(getThemeButton()).toHaveFocus();

    await user.keyboard(" ");
    expect(uiStore.getState().theme).toBe("light");

    await user.keyboard("{Enter}");
    expect(uiStore.getState().theme).toBe("dark");
  });

  it("renders the Spanish action copy from i18n, proving no hardcoded English", () => {
    renderSwitcher("es");

    expect(getThemeButton()).toHaveAccessibleName("Cambiar a Claro");
    expect(getThemeButton()).toHaveAttribute("title", "Cambiar a Claro");
    expect(screen.queryByText("Switch to Light")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderSwitcher();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
