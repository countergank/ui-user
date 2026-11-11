import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";
import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { ResetPasswordPage } from "./reset-password-page";

const tAuth = i18n.getFixedT(null, "auth");
const tCommon = i18n.getFixedT(null, "common");

const RESET_URL = "https://test.invalid/auth/reset-password";
const TOKEN = "a-valid-token";

function apiFailure(status: number, code: string) {
  return HttpResponse.json({ statusCode: status, code, message: code }, { status });
}

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  window.localStorage.clear();
});

function renderPage(entry = `/reset-password?token=${TOKEN}`) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <ResetPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillAndSubmit(password = "Str0ng!Vault", confirm = password) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(tAuth("reset.fields.password")), password);
  await user.type(screen.getByLabelText(tAuth("reset.fields.confirm")), confirm);
  await user.click(screen.getByRole("button", { name: tAuth("reset.submit") }));
}

describe("reset password page — MSW", () => {
  it("posts the token and the new password, then shows the success state with the login CTA", async () => {
    let received: unknown = null;
    server.use(
      http.post(RESET_URL, async ({ request }) => {
        received = await request.json();

        return HttpResponse.json(null, { status: 200 });
      }),
    );

    renderPage();
    await fillAndSubmit();

    expect(await screen.findByRole("status")).toHaveTextContent(tAuth("reset.success"));
    expect(received).toEqual({ token: TOKEN, newPassword: "Str0ng!Vault" });
    expect(screen.getByRole("link", { name: tAuth("reset.backToLogin") })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("button", { name: tAuth("reset.submit") })).not.toBeInTheDocument();
  });

  it("shows the dedicated invalid-token state on UA-AUTH-005 with a link to request a new one", async () => {
    server.use(http.post(RESET_URL, () => apiFailure(400, "UA-AUTH-005")));

    renderPage();
    await fillAndSubmit();

    const heading = await screen.findByRole("heading", { name: tAuth("reset.invalidTokenTitle") });

    expect(heading).toBeInTheDocument();
    expect(screen.getByText(tAuth("reset.errors.invalidToken"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: tAuth("reset.requestNewLink") })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.queryByRole("button", { name: tAuth("reset.submit") })).not.toBeInTheDocument();
  });

  it("shows the generic error on any other failure and keeps the form", async () => {
    server.use(http.post(RESET_URL, () => apiFailure(500, "HTTP_ERROR")));

    renderPage();
    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(tCommon("error.genericMessage"));
    expect(screen.getByRole("button", { name: tAuth("reset.submit") })).toBeEnabled();
  });
});

describe("reset password page — form validation", () => {
  it("reports the mismatch on the confirm field without calling the API", async () => {
    const api = vi.fn();
    server.use(
      http.post(RESET_URL, () => {
        api();

        return HttpResponse.json(null, { status: 200 });
      }),
    );

    renderPage();
    await fillAndSubmit("Str0ng!Vault", "Different1!");

    expect(await screen.findByText(tAuth("reset.errors.mismatch"))).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  it("marks unmet password rules in the checklist while typing", async () => {
    const user = userEvent.setup();

    renderPage();
    await user.type(screen.getByLabelText(tAuth("reset.fields.password")), "abc");

    const items = screen.getAllByRole("listitem").map((item) => item.textContent);

    expect(items).toEqual([
      tAuth("reset.passwordRules.length"),
      tAuth("reset.passwordRules.lowercase"),
      tAuth("reset.passwordRules.uppercase"),
      tAuth("reset.passwordRules.digit"),
      tAuth("reset.passwordRules.special"),
      tAuth("reset.passwordRules.unique"),
    ]);
  });
});

describe("reset password page — missing token", () => {
  it("renders the invalid-token state when the token is absent", () => {
    renderPage("/reset-password");

    expect(
      screen.getByRole("heading", { name: tAuth("reset.invalidTokenTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(tAuth("reset.errors.invalidToken"))).toBeInTheDocument();
  });
});

describe("reset password page — a11y", () => {
  it("has no axe violations on the form state", async () => {
    const { container } = renderPage();

    expect(await axe(container)).toHaveNoViolations();
    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations on the success state", async () => {
    server.use(http.post(RESET_URL, () => HttpResponse.json(null, { status: 200 })));
    const { container } = renderPage();
    await fillAndSubmit();
    await screen.findByRole("status");

    expect(await axe(container)).toHaveNoViolations();
    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations on the invalid-token state", async () => {
    const { container } = renderPage("/reset-password");

    expect(await axe(container)).toHaveNoViolations();
    expectNoAuthoredInlineStyles(container);
  });
});
