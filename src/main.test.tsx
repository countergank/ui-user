// Entry bootstrap test: mounts the real app into #root (STACK-3/7, COU-310).
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("main entry", () => {
  // Importing the whole app graph pushes this past the 5s default under the full suite.
  it("bootstraps the app and renders the informational home", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("@/main");

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Countergank User");
  }, 20_000);
});
