import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { ForgotPasswordPage } from "./forgot-password-page";

const t = i18n.getFixedT(null, "auth");

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("forgot password page", () => {
  it("renders the title as the single level-1 heading with its own main landmark", () => {
    renderPage();

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t("forgot.title"));
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText(t("forgot.subtitle"))).toBeInTheDocument();
  });

  it("renders the email form with its submit button", () => {
    renderPage();

    expect(screen.getByLabelText(t("forgot.fields.email"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("forgot.submit") })).toBeEnabled();
  });

  it("shows no success state before submitting", () => {
    renderPage();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: t("forgot.backToLogin") })).not.toBeInTheDocument();
  });

  it("renders without any of the app shell's landmarks", () => {
    renderPage();

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
