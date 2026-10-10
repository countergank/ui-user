// Axe pipeline instrumentation: proves the axe runner actually DETECTS WCAG
// violations, so `expect(...).toHaveNoViolations()` elsewhere is meaningful
// rather than vacuously green (strict-tdd empty-collection rule).
import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

describe("axe instrumentation", () => {
  it("detects a missing image alt text", async () => {
    // Built via createElement (not JSX) so a11y linters do not flag the fixture:
    // the missing alt is the required precondition for the axe probe.
    const { container } = render(createElement("img", { src: "/decoy.png" }));
    const results = await axe(container);
    const violationIds = results.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
  });
});
