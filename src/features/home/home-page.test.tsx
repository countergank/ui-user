// Integration tests for the home container: TanStack Query loading/success/error
// states and retry recovery (ARCH-3, ARCH-4, TEST-2/3). Copy assertions are
// derived from the i18n resources so they exercise translations instead of
// fragile hardcoded strings (COU-253).
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

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

    const loading = screen.getByText(i18n.t("home.loading"));
    expect(loading).toHaveAttribute("aria-busy", "true");
  });

  it("renders the hero and highlight cards once data loads", async () => {
    renderHome();

    // The hero title interpolates a time-based greeting; assert the resource's
    // static portion so the expectation stays derived from translations.
    const heroTitleTail = i18n.t("home.hero.title", { greeting: "" }).replace(/^!\s*/, "");
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(heroTitleTail);
    const list = await screen.findByRole("list", { name: i18n.t("home.highlights.listLabel") });
    expect(list).toBeInTheDocument();
    expect(
      await screen.findByText(i18n.t("home.highlights.items.routing.title")),
    ).toBeInTheDocument();
  });

  it("renders an accessible error and recovers after retry clears the cause", async () => {
    const user = userEvent.setup();
    window.location.hash = "#fail";
    renderHome();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("home.error.highlightsUnavailable"));
    expect(alert).toHaveTextContent(i18n.t("home.error.demoFailure"));

    // Refetch while the failure cause is still present: error stays.
    await user.click(screen.getByRole("button", { name: i18n.t("error.retry") }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      i18n.t("home.error.highlightsUnavailable"),
    );

    // Remove the failure cause and retry: the page recovers to content.
    window.location.hash = "";
    await user.click(screen.getByRole("button", { name: i18n.t("error.retry") }));
    const heroTitleTail = i18n.t("home.hero.title", { greeting: "" }).replace(/^!\s*/, "");
    const recoveredHeading = await screen.findByRole("heading", { level: 1 });
    expect(recoveredHeading).toHaveTextContent(heroTitleTail);
  });

  it("has no axe violations once loaded", async () => {
    const { container } = renderHome();
    await screen.findByRole("list", { name: i18n.t("home.highlights.listLabel") });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
