import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { ConfirmEmailPage } from "./confirm-email-page";

const CONFIRM_URL = "https://test.invalid/auth/confirm-email-change";

const t = i18n.getFixedT(null, "auth");

const TOKEN = "58fcd204-0a43-47db-995e-84e44b7000c0";

let confirmCount = 0;
let confirmBody: { token?: string } | null = null;

const server = setupServer(
  http.post(CONFIRM_URL, async ({ request }) => {
    confirmCount += 1;
    confirmBody = (await request.json()) as { token?: string };

    return new HttpResponse(null, { status: 200 });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

afterEach(() => {
  server.resetHandlers();
  confirmCount = 0;
  confirmBody = null;
});

afterAll(() => {
  server.close();
});

function renderPage(token: string | null) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const entries = token === null ? ["/confirm-email"] : [`/confirm-email?token=${token}`];

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={entries}>
          <ConfirmEmailPage />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { container };
}

describe("ConfirmEmailPage", () => {
  it("posts the URL token on mount and shows the success state with the login CTA", async () => {
    const { container } = renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailChange.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailChange.success"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("emailChange.goToLogin") })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(confirmCount).toBe(1);
    expect(confirmBody).toEqual({ token: TOKEN });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the invalid-token state without posting when the token is missing", async () => {
    const { container } = renderPage(null);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailChange.invalidTokenTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailChange.errors.invalidToken"))).toBeInTheDocument();

    expect(confirmCount).toBe(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the invalid-token state when the backend rejects the token", async () => {
    server.use(
      http.post(CONFIRM_URL, () => {
        confirmCount += 1;

        return HttpResponse.json(
          { statusCode: 400, code: "UA-AUTH-008", message: "no pending", traceId: "t-1" },
          { status: 400 },
        );
      }),
    );
    renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailChange.invalidTokenTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailChange.errors.invalidToken"))).toBeInTheDocument();

    expect(confirmCount).toBe(1);
  });

  it("fires the confirmation exactly once per token after the request settles", async () => {
    server.use(
      http.post(CONFIRM_URL, () => {
        confirmCount += 1;

        return HttpResponse.json(
          { statusCode: 400, code: "UA-AUTH-007", message: "invalid token", traceId: "t-2" },
          { status: 400 },
        );
      }),
    );
    renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailChange.invalidTokenTitle") }),
    ).toBeInTheDocument();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(confirmCount).toBe(1);
  });
});
