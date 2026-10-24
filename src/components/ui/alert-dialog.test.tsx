import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

function renderAlertDialog() {
  return render(
    <AlertDialog>
      <AlertDialogTrigger>Delete member</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this member?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep member</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

async function openAlertDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Delete member" }));

  return screen.findByRole("alertdialog");
}

describe("AlertDialog", () => {
  it("stays closed until the trigger is activated", () => {
    renderAlertDialog();

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("opens with the alertdialog role and an accessible name and description", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    const dialog = await openAlertDialog(user);

    expect(dialog).toHaveAccessibleName("Delete this member?");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("offers exactly the cancel and confirm choices, styled as buttons", async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await openAlertDialog(user);

    expect(screen.getByRole("button", { name: "Keep member" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("bg-primary");
  });

  it("renders no inline styles on the elements it authors (S4)", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderAlertDialog();
    await openAlertDialog(user);

    expectNoAuthoredInlineStyles(baseElement);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await openAlertDialog(user);

    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
