// Component tests for the presentational FeatureCards list (ARCH-3).
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import type { FeatureHighlight } from "../api";
import { FeatureCards } from "./feature-cards";

const FEATURES: FeatureHighlight[] = [
  { id: "a", title: "Accessible shell", description: "Landmarks and skip link." },
  { id: "b", title: "Server state", description: "TanStack Query wired in." },
  { id: "c", title: "Lazy routes", description: "Per-route code splitting." },
];

describe("FeatureCards", () => {
  it("renders one list item per feature with an accessible name", () => {
    render(<FeatureCards features={FEATURES} />);

    const list = screen.getByRole("list", { name: "Template highlights" });
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText("Accessible shell")).toBeInTheDocument();
    expect(within(items[1]).getByText("Server state")).toBeInTheDocument();
    expect(within(items[2]).getByText("Lazy routes")).toBeInTheDocument();
  });

  it("renders an empty list when no features are provided", () => {
    render(<FeatureCards features={[]} />);

    const list = screen.getByRole("list", { name: "Template highlights" });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("has no axe violations", async () => {
    const { container } = render(<FeatureCards features={FEATURES} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
