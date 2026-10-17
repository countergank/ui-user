// Component tests for the shadcn/ui Dialog primitives (COU-271, S2-S5, S7).
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { createI18nInstance } from "@/lib/i18n";
import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function renderDialog(instance: I18nInstance = createI18nInstance({ lng: "en" })) {
  return render(
    <I18nextProvider i18n={instance}>
      <Dialog>
        <DialogTrigger>Open settings</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workspace settings</DialogTitle>
            <DialogDescription>Change who can access this workspace.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </I18nextProvider>,
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open settings" }));

  return screen.findByRole("dialog");
}

describe("Dialog", () => {
  it("stays closed until the trigger is activated", () => {
    renderDialog();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens with the title and description wired to the dialog", async () => {
    const user = userEvent.setup();
    renderDialog();

    const dialog = await openDialog(user);

    expect(dialog).toHaveAccessibleName("Workspace settings");
    expect(dialog).toHaveAccessibleDescription("Change who can access this workspace.");
  });

  it("labels the close control from the translation bundle", async () => {
    const user = userEvent.setup();
    renderDialog();
    await openDialog(user);

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("ships the close label in Spanish too — parity, not an English hardcode", async () => {
    const user = userEvent.setup();
    renderDialog(createI18nInstance({ lng: "es" }));
    await openDialog(user);

    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderDialog();
    await openDialog(user);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("renders no inline styles on the elements it authors (S4)", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderDialog();
    await openDialog(user);

    expectNoAuthoredInlineStyles(baseElement);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderDialog();
    await openDialog(user);

    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
