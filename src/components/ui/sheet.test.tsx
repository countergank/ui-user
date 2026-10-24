import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { createI18nInstance } from "@/lib/i18n";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

function renderSheet(
  side: "top" | "right" | "bottom" | "left" = "right",
  instance: I18nInstance = createI18nInstance({ lng: "en" }),
) {
  return render(
    <I18nextProvider i18n={instance}>
      <Sheet>
        <SheetTrigger>Open filters</SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the member list.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </I18nextProvider>,
  );
}

async function openSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open filters" }));

  return screen.findByRole("dialog");
}

describe("Sheet", () => {
  it("stays closed until the trigger is activated", () => {
    renderSheet();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as a dialog named and described by its header", async () => {
    const user = userEvent.setup();
    renderSheet();

    const sheet = await openSheet(user);

    expect(sheet).toHaveAccessibleName("Filters");
    expect(sheet).toHaveAccessibleDescription("Narrow the member list.");
  });

  it.each([
    ["left", "inset-y-0", "left-0"],
    ["right", "inset-y-0", "right-0"],
  ] as const)("maps the %s side variant to its edge", async (side, inset, edge) => {
    const user = userEvent.setup();
    renderSheet(side);

    const sheet = await openSheet(user);

    expect(sheet).toHaveClass(inset, edge);
  });

  it("labels the close control from the translation bundle", async () => {
    const user = userEvent.setup();
    renderSheet();
    await openSheet(user);

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderSheet();
    await openSheet(user);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("renders no inline styles on the elements it authors (S4)", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderSheet();
    await openSheet(user);

    expectNoAuthoredInlineStyles(baseElement);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderSheet();
    await openSheet(user);

    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
