// Language switcher tests (COU-310, T9 / S12).
// What the owner asked for is not "a button": it is that the copy can change language, so
// the assertions follow the effect — visible copy, `<html lang>`, the stored preference.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslation } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";
import { LANGUAGE_STORAGE_KEY } from "@/lib/i18n/language";

import { LanguageSwitcher } from "./language-switcher";

/** A tiny consumer so the copy change is observable, not just the i18n instance. */
function Harness() {
  const { t } = useTranslation("landing");

  return <p>{t("subtitle")}</p>;
}

afterEach(async () => {
  // The i18n instance is a module singleton: leave it in the default language.
  await i18n.changeLanguage("en");
  window.localStorage.clear();
});

describe("language switcher", () => {
  it("offers the three shipped languages and marks the active one", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change language" }));

    const options = await screen.findAllByRole("menuitem");
    expect(options.map((option) => option.textContent)).toEqual([
      "English",
      "Español",
      "Português (Brasil)",
    ]);
    expect(options[0]).toHaveAttribute("aria-current", "true");
    expect(options[1]).not.toHaveAttribute("aria-current");
  });

  it("changes the visible copy and the document language", async () => {
    const user = userEvent.setup();
    const englishCopy = i18n.getFixedT("en", "landing")("subtitle");
    render(
      <>
        <LanguageSwitcher />
        <Harness />
      </>,
    );

    expect(screen.getByText(englishCopy)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Change language" }));
    await user.click(await screen.findByRole("menuitem", { name: /Español/ }));

    const spanishCopy = i18n.getFixedT("es", "landing")("subtitle");
    await waitFor(() => {
      expect(screen.getByText(spanishCopy)).toBeInTheDocument();
    });
    expect(document.documentElement.lang).toBe("es");
  });

  it("remembers the choice for the next visit", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change language" }));
    await user.click(await screen.findByRole("menuitem", { name: /Português/ }));

    await waitFor(() => {
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pt");
    });
  });

  it("has no axe violations", async () => {
    const { container } = render(<LanguageSwitcher />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
