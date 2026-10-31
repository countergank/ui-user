import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { LoginPage } from "./login-page";

const t = i18n.getFixedT(null, "auth");

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("login page", () => {
  it("renders the login title as the single level-1 heading", () => {
    renderPage();

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t("login.title"));
  });

  it("renders the subtitle and its own main landmark", () => {
    renderPage();

    expect(screen.getByText(t("login.subtitle"))).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders the brand panel copy without adding another heading", () => {
    renderPage();

    expect(screen.getByText(t("login.brand.eyebrow"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.status"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.headline"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.lead"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.bullets.rbac"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.bullets.audit"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.bullets.revocation"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.bullets.templates"))).toBeInTheDocument();
    expect(screen.getByText(t("login.brand.services"))).toBeInTheDocument();

    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("offers the remember-me checkbox next to the forgot-password link", () => {
    renderPage();

    const checkbox = screen.getByRole("checkbox", { name: t("login.remember") });

    expect(checkbox).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("login.forgotPassword") })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("renders the create-account action as a disabled button described by its own hint", () => {
    renderPage();

    const button = screen.getByRole("button", { name: t("login.createAccount") });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-describedby", "login-create-account-hint");
    expect(screen.getByText(t("login.createAccountHint"))).toHaveAttribute(
      "id",
      "login-create-account-hint",
    );
  });

  it("renders the legal terms and privacy placeholders as disabled link-styled buttons", () => {
    renderPage();

    expect(screen.getByRole("button", { name: t("login.legal.terms") })).toBeDisabled();
    expect(screen.getByRole("button", { name: t("login.legal.privacy") })).toBeDisabled();
  });

  it("keeps the form-column footer with the copyright and a link back to the site", () => {
    renderPage();

    expect(screen.getByText(t("login.footer.copyright", { year: 2026 }))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("login.footer.backToSite") })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders without any of the app shell's landmarks", () => {
    renderPage();

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: i18n.t("shell.skipLink") })).not.toBeInTheDocument();
  });
});
