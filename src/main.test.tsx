// Entry bootstrap test: mounts the real app (main.tsx) into #root and proves
// the router + query client wire up to render the lazy home route (STACK-3/7).
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("main entry", () => {
  // This test imports the whole app graph (router, query client, lazy routes), so it
  // pays the dynamic-import cost of every module the entry pulls in. Under the full
  // 48-file suite that cost sits past the 5s default and produced an intermittent
  // timeout unrelated to behaviour; the explicit budget keeps it deterministic.
  it("bootstraps the app and renders the home page", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("@/main");

    expect(
      await screen.findByRole("heading", { name: /standard frontend template/i }),
    ).toBeInTheDocument();
  }, 20_000);
});
