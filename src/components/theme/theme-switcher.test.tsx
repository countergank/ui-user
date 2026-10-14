import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { createI18nInstance } from "@/lib/i18n";
import { uiStore } from "@/stores/use-ui-store";
import { matchMediaStub } from "@/test/setup";

import { ThemeSwitcher } from "./theme-switcher";

// Tests for the single-button theme control (COU-270).
//
// The control was rebuilt as ONE icon button that cycles through the three
// preferences (`light → dark → system → light`) because the three-segment
// control was rejected on review. A plain sun/moon toggle was rejected too: it
// would put `system` out of UI reach forever after the first click, which would
// make the live `matchMedia` subscription in `src/lib/theme/theme-sync.ts`
// effectively dead code.
//
// Two properties are easy to get wrong and are covered explicitly below:
//   1. The ICON reflects the stored PREFERENCE, never the resolved theme, so
//      `system` stays visible as `Monitor` even while the OS asks for dark.
//   2. The accessible NAME describes the ACTION on the NEXT preference, e.g.
//      "Switch to Light" while the stored preference is `system`.
//
// `startThemeSync()` lives in `src/main.tsx` and is deliberately NOT started
// here: the DOM `.dark` class is its responsibility, so these tests assert the
// store, the accessible name and the rendered icon instead of the `<html>`
// class list.

/** Render the control against an isolated i18n instance for the given language. */
function renderSwitcher(language: "en" | "es" | "pt" = "en") {
  const i18n = createI18nInstance({ lng: language });
  const view = render(
    <I18nextProvider i18n={i18n}>
      <ThemeSwitcher />
    </I18nextProvider>,
  );

  return { ...view, i18n };
}

/** The single theme button, whatever its current accessible name. */
function getThemeButton(): HTMLElement {
  return screen.getByRole("button");
}

/**
 * The lucide icon rendered inside the button. lucide stamps every icon with a
 * `lucide-<name>` class (`lucide-react`'s public className contract), which is
 * the only handle a screen reader deliberately cannot see — the icon is
 * `aria-hidden`, so there is no role/name query for it.
 */
function getThemeIcon(): SVGElement {
  const icon = getThemeButton().querySelector("svg");

  if (icon === null) {
    throw new Error("The theme button must render a lucide icon");
  }

  return icon;
}

/** Set the stored preference directly, the way the pre-paint hydration would. */
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

    // Default preference is `system`, so the first click lands on `light`.
    expect(getThemeButton()).toHaveAccessibleName("Switch to Light");
    expect(getThemeButton()).toHaveAttribute("title", "Switch to Light");
  });

  it("cycles light → dark → system → light with wrap-around, and renames the action each time", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    // `system` → `light`
    await user.click(getThemeButton());
    expect(uiStore.getState().theme).toBe("light");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Dark");

    // `light` → `dark`
    await user.click(getThemeButton());
    expect(uiStore.getState().theme).toBe("dark");
    expect(getThemeButton()).toHaveAccessibleName("Switch to Automatic");

    // `dark` → `system` (the wrap-around's second half)
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

      // One icon only: a "render all three, hide two with CSS" implementation
      // would pass a class check but leaks into the accessibility tree.
      expect(button.querySelectorAll("svg")).toHaveLength(1);
      expect(getThemeIcon()).toHaveClass(iconClass);
      // The class is lucide's own label; the child element proves the geometry
      // is the icon we claim (a circle for the sun, a rect for the monitor).
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

    // Default: `system` → the monitor.
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

    // The OS now asks for dark, but the preference is still `system`: a
    // resolved-theme implementation would swap the icon to the moon here.
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

    // Default preference is `system`, so the next mode is `light` → "Claro".
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
