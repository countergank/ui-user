import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("announces itself through the alert role and renders its title and description", () => {
    render(
      <Alert>
        <AlertTitle>Session expired</AlertTitle>
        <AlertDescription>Sign in again to continue.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");

    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Session expired")).toBeInTheDocument();
    expect(screen.getByText("Sign in again to continue.")).toBeInTheDocument();
  });

  it.each([
    ["default", "bg-background"],
    ["destructive", "text-destructive"],
  ] as const)("maps the %s variant to its design token", (variant, tokenClass) => {
    render(
      <Alert variant={variant}>
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    );

    expect(screen.getByRole("alert")).toHaveClass(tokenClass);
  });

  it("defaults to the neutral variant when none is given", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    );

    expect(screen.getByRole("alert")).toHaveClass("bg-background");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    );

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Session expired</AlertTitle>
        <AlertDescription>Sign in again to continue.</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
