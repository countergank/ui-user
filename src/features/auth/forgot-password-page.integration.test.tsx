import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";
import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { ForgotPasswordPage } from "./forgot-password-page";

const tAuth = i18n.getFixedT(null, "auth");
const tCommon = i18n.getFixedT(null, "common");

const FORGOT_URL = "https://test.invalid/auth/forgot-password";

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

function renderPage(entry = "/forgot-password") {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <ForgotPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function submitEmail(email = "user@example.com") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(tAuth("forgot.fields.email")), email);
  await user.click(screen.getByRole("button", { name: tAuth("forgot.submit") }));
}

describe("forgot password page — MSW", () => {
  it("posts the email and shows the generic success state with the back link", async () => {
    let received: unknown = null;
    server.use(
      http.post(FORGOT_URL, async ({ request }) => {
        received = await request.json();

        return HttpResponse.json(null, { status: 200 });
      }),
    );

    renderPage();
    await submitEmail();

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(tAuth("forgot.success"));
    expect(received).toEqual({ email: "user@example.com" });
    expect(screen.getByRole("link", { name: tAuth("forgot.backToLogin") })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("button", { name: tAuth("forgot.submit") })).not.toBeInTheDocument();
  });

  it("shows the identical success message for an unknown email (anti-enumeration)", async () => {
    server.use(http.post(FORGOT_URL, () => HttpResponse.json(null, { status: 200 })));

    renderPage();
    await submitEmail("nobody@example.com");
    const unknownEmailStatus = await screen.findByRole("status");
    const unknownEmailMessage = unknownEmailStatus.textContent;

    server.resetHandlers();
    renderPage();
    await submitEmail("registered@example.com");
    const registeredEmailStatus = await screen.findByRole("status");

    expect(registeredEmailStatus.textContent).toBe(unknownEmailMessage);
    expect(unknownEmailMessage).toBe(tAuth("forgot.success"));
  });

  it("shows the rate-limit message and disables the submit on 429", async () => {
    server.use(http.post(FORGOT_URL, () => apiFailure(429, "HTTP_ERROR")));

    renderPage();
    await submitEmail();

    expect(await screen.findByRole("alert")).toHaveTextContent(tAuth("forgot.errors.rateLimited"));
    expect(screen.getByRole("button", { name: tAuth("forgot.submit") })).toBeDisabled();
  });

  it("shows the generic error on any other failure", async () => {
    server.use(http.post(FORGOT_URL, () => apiFailure(500, "HTTP_ERROR")));

    renderPage();
    await submitEmail();

    expect(await screen.findByRole("alert")).toHaveTextContent(tCommon("error.genericMessage"));
    expect(screen.getByRole("button", { name: tAuth("forgot.submit") })).toBeEnabled();
  });

  it("describes the email field with its own error and focuses it", async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: tAuth("forgot.submit") }));

    const email = screen.getByLabelText(tAuth("forgot.fields.email"));
    const message = await screen.findByText(tAuth("forgot.errors.emailRequired"));
    expect(email.getAttribute("aria-describedby")).toContain(message.id);
    expect(email).toHaveFocus();
  });

  it("keeps the alert focused when the submission fails", async () => {
    server.use(http.post(FORGOT_URL, () => apiFailure(429, "HTTP_ERROR")));

    renderPage();
    await submitEmail();

    expect(await screen.findByRole("alert")).toHaveFocus();
  });

  it("has no axe violations in the form state", async () => {
    const { container } = renderPage();

    expectNoAuthoredInlineStyles(container);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the success state", async () => {
    server.use(http.post(FORGOT_URL, () => HttpResponse.json(null, { status: 200 })));

    const { container } = renderPage();
    await submitEmail();
    await screen.findByRole("status");

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the error state either", async () => {
    server.use(http.post(FORGOT_URL, () => apiFailure(429, "HTTP_ERROR")));

    const { container } = renderPage();
    await submitEmail();
    await screen.findByRole("alert");

    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a clean form after an in-flight submit was unmounted", async () => {
    server.use(http.post(FORGOT_URL, () => apiFailure(429, "HTTP_ERROR")));

    const { unmount } = renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(tAuth("forgot.fields.email")), "user@example.com");
    await user.click(screen.getByRole("button", { name: tAuth("forgot.submit") }));
    unmount();

    renderPage();

    expect(await screen.findByLabelText(tAuth("forgot.fields.email"))).toHaveValue("");
    expect(screen.getByRole("button", { name: tAuth("forgot.submit") })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
