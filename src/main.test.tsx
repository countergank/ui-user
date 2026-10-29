import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("main entry", () => {
  it("bootstraps the app and renders the informational home", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("@/main");

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Real permissions, controlled sessions, everything audited.",
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }, 20_000);
});
