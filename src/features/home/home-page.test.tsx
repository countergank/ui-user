// Integration tests for the home container: TanStack Query loading/success/error
// states and retry recovery (ARCH-3, ARCH-4, TEST-2/3).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { HomePage } from "./home-page";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderHome(client: QueryClient = createQueryClient()) {
  return render(
    <QueryClientProvider client={client}>
      <HomePage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  window.location.hash = "";
});

describe("HomePage", () => {
  it("shows a loading state while highlights are pending", () => {
    renderHome();

    const loading = screen.getByText("Loading highlights…");
    expect(loading).toHaveAttribute("aria-busy", "true");
  });

  it("renders the hero and highlight cards once data loads", async () => {
    renderHome();

    expect(
      await screen.findByRole("heading", { name: /standard frontend template/i }),
    ).toBeInTheDocument();
    const list = await screen.findByRole("list", { name: "Template highlights" });
    expect(list).toBeInTheDocument();
    expect(await screen.findByText("Lazy routes")).toBeInTheDocument();
  });

  it("renders an accessible error and recovers after retry clears the cause", async () => {
    const user = userEvent.setup();
    window.location.hash = "#fail";
    renderHome();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load template highlights");
    expect(alert).toHaveTextContent("Demo failure");

    // Refetch while the failure cause is still present: error stays.
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load template highlights",
    );

    // Remove the failure cause and retry: the page recovers to content.
    window.location.hash = "";
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("heading", { name: /standard frontend template/i }),
    ).toBeInTheDocument();
  });

  it("has no axe violations once loaded", async () => {
    const { container } = renderHome();
    await screen.findByRole("list", { name: "Template highlights" });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
