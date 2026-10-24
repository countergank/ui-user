// Component tests for the shadcn/ui Avatar primitives (COU-271, S2-S5).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("shows the fallback until an image has loaded", () => {
    render(
      <Avatar>
        <AvatarImage src="/avatars/leandro.png" alt="Leandro Cepeda" />
        <AvatarFallback>LC</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("LC")).toBeInTheDocument();
  });

  it.each([
    ["sm", "h-8", "w-8"],
    ["default", "h-10", "w-10"],
    ["lg", "h-12", "w-12"],
  ] as const)("maps the %s size variant to its scale", (size, height, width) => {
    render(
      <Avatar size={size} data-testid="avatar">
        <AvatarFallback>LC</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByTestId("avatar")).toHaveClass(height, width);
  });

  it("defaults to the medium size", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>LC</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByTestId("avatar")).toHaveClass("h-10", "w-10");
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>LC</AvatarFallback>
      </Avatar>,
    );

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/avatars/leandro.png" alt="Leandro Cepeda" />
        <AvatarFallback>LC</AvatarFallback>
      </Avatar>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
