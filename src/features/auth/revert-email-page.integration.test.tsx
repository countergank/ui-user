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

import { RevertEmailPage } from "./revert-email-page";

const REVERT_URL = "https://test.invalid/auth/revert-email-change";

const t = i18n.getFixedT(null, "auth");

const TOKEN = "1d84a5f6-0b2e-4f1a-9f3c-5a0f8f2b7e11";

let revertCount = 0;
let revertBody: { token?: string } | null = null;

const server = setupServer(
  http.post(REVERT_URL, async ({ request }) => {
    revertCount += 1;
    revertBody = (await request.json()) as { token?: string };

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
  revertCount = 0;
  revertBody = null;
});

afterAll(() => {
  server.close();
});

function renderPage(token: string | null) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const entries =
    token === null ? ["/revert-email-change"] : [`/revert-email-change?token=${token}`];

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={entries}>
          <RevertEmailPage />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { container };
}

describe("RevertEmailPage", () => {
  it("posts the URL token on mount and shows the success state with the login CTA", async () => {
    const { container } = renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailRevert.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailRevert.success"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("emailRevert.goToLogin") })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(revertCount).toBe(1);
    expect(revertBody).toEqual({ token: TOKEN });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the invalid-token state without posting when the token is missing", async () => {
    const { container } = renderPage(null);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailRevert.invalidTokenTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailRevert.errors.invalidToken"))).toBeInTheDocument();

    expect(revertCount).toBe(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the invalid-token state when the backend rejects the token", async () => {
    server.use(
      http.post(REVERT_URL, () => {
        revertCount += 1;

        return HttpResponse.json(
          { statusCode: 401, code: "UA-SEC-001", message: "invalid token", traceId: "t-1" },
          { status: 401 },
        );
      }),
    );
    renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailRevert.invalidTokenTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailRevert.errors.invalidToken"))).toBeInTheDocument();

    expect(revertCount).toBe(1);
  });

  it("shows the dedicated window-expired state on 410 UA-AUTH-011", async () => {
    server.use(
      http.post(REVERT_URL, () => {
        revertCount += 1;

        return HttpResponse.json(
          {
            statusCode: 410,
            code: "UA-AUTH-011",
            message: "revert window expired",
            traceId: "t-2",
          },
          { status: 410 },
        );
      }),
    );
    const { container } = renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailRevert.windowExpiredTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("emailRevert.errors.windowExpired"))).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: t("emailRevert.invalidTokenTitle") })).toBeNull();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("fires the revert exactly once per token after the request settles", async () => {
    server.use(
      http.post(REVERT_URL, () => {
        revertCount += 1;

        return HttpResponse.json(
          {
            statusCode: 410,
            code: "UA-AUTH-011",
            message: "revert window expired",
            traceId: "t-3",
          },
          { status: 410 },
        );
      }),
    );
    renderPage(TOKEN);

    expect(
      await screen.findByRole("heading", { level: 1, name: t("emailRevert.windowExpiredTitle") }),
    ).toBeInTheDocument();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(revertCount).toBe(1);
  });
});
