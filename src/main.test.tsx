// Entry bootstrap test: mounts the real app (main.tsx) into #root and proves
// the router + query client wire up to render the lazy home route (STACK-3/7).
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("main entry", () => {
  it("bootstraps the app and renders the home page", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("@/main");

    expect(
      await screen.findByRole("heading", { name: /standard frontend template/i }),
    ).toBeInTheDocument();
  });
});
