// Component tests for the presentational Hero (ARCH-2/ARCH-3, a11y).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Hero } from "./hero";

describe("Hero", () => {
  it("renders the title and subtitle", () => {
    render(<Hero title="Welcome" subtitle="The standard template" />);

    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(screen.getByText("The standard template")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <Hero title="Welcome" subtitle="sub">
        <a href="/about">Learn more</a>
      </Hero>,
    );

    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/about");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Hero title="Welcome" subtitle="The standard template" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
