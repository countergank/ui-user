import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// Integration tests for the application shell (ARCH-6, ADR-6): landmarks, skip
// link, navigation, focus management, route announcer, axe on the full layout.
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { AppShell } from "./app-shell";

function renderShell(initialPath = "/") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        Component: AppShell,
        children: [
          { index: true, Component: () => <h1>Home content</h1> },
          { path: "about", Component: () => <h1>About content</h1> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  const { container } = render(<RouterProvider router={router} />);
  return { router, container };
}

describe("AppShell", () => {
  it("provides the expected landmarks", () => {
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the skip link as the first focusable landmark target", () => {
    renderShell();

    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveAttribute("href", "#main-content");
  });

  it("does not steal focus on initial load so the skip link stays first in the tab order", () => {
    renderShell("/");

    expect(screen.getByRole("main")).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it("navigates via the header navigation and parks focus on main content", async () => {
    const user = userEvent.setup();
    renderShell("/");

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    await user.click(within(nav).getByRole("link", { name: "About" }));

    expect(screen.getByRole("heading", { name: "About content" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("announces the route title after navigation", async () => {
    const user = userEvent.setup();
    renderShell("/");

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    await user.click(within(nav).getByRole("link", { name: "About" }));

    const status = screen.getByRole("status");
    await waitFor(() => expect(status).toHaveTextContent("About page loaded"));
  });

  it("has no axe violations on the full layout", async () => {
    const { container } = renderShell("/");
    await screen.findByRole("heading", { name: "Home content" });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
