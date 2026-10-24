import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

describe("axe instrumentation", () => {
  it("detects a missing image alt text", async () => {
    const { container } = render(createElement("img", { src: "/decoy.png" }));
    const results = await axe(container);
    const violationIds = results.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
  });
});
