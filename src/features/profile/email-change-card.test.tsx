import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { EmailChangeCard } from "./email-change-card";

const CHANGE_EMAIL_URL = "https://test.invalid/users/change-email";
const CHANGE_EMAIL_CODE_URL = "https://test.invalid/users/change-email/code";
const REFRESH_URL = "https://test.invalid/auth/refresh";

const CURRENT_EMAIL = "mcabrera@countergank.com";

const t = i18n.getFixedT(null, "profile");

let changeEmailBody: { email?: string; code?: string } | null = null;
let changeEmailCount = 0;
let codeCount = 0;

const server = setupServer(
  http.post(REFRESH_URL, () =>
    HttpResponse.json({ accessToken: "access-2", refreshToken: "refresh-2" }),
  ),
  http.post(CHANGE_EMAIL_CODE_URL, () => {
    codeCount += 1;

    return new HttpResponse(null, { status: 200 });
  }),
  http.post(CHANGE_EMAIL_URL, async ({ request }) => {
    changeEmailBody = (await request.json()) as { email?: string; code?: string };
    changeEmailCount += 1;

    return new HttpResponse(null, { status: 200 });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: CURRENT_EMAIL,
      userName: "mcabrera",
      name: "Martina",
      lastName: "Cabrera",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
});

afterEach(() => {
  toast.dismiss();
  server.resetHandlers();
  changeEmailBody = null;
  changeEmailCount = 0;
  codeCount = 0;
  sessionStore.setState(initialSessionState);
});

afterAll(() => {
  server.close();
});

function renderCard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <EmailChangeCard currentEmail={CURRENT_EMAIL} />
        <Toaster />
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { container, client };
}

async function requestCode(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(t("email.fields.newEmail")), "nueva@countergank.com");
  await user.click(screen.getByRole("button", { name: t("email.actions.sendCode") }));

  expect(await screen.findByRole("alert")).toHaveTextContent(t("email.codeSent"));
}

describe("EmailChangeCard", () => {
  it("renders the card with the form and the confirmation notice", async () => {
    const { container } = renderCard();

    expect(screen.getByRole("heading", { name: t("email.title"), level: 3 })).toBeInTheDocument();
    expect(screen.getByLabelText(t("email.fields.newEmail"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("email.fields.code"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("email.fields.code"))).toBeDisabled();
    expect(screen.getByRole("button", { name: t("email.actions.sendCode") })).toBeInTheDocument();
    expect(screen.getByText(t("email.description"))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: t("email.submit") })).toBeDisabled();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("rejects an invalid format before any network traffic", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.type(screen.getByLabelText(t("email.fields.newEmail")), "no-un-email");
    await user.click(screen.getByRole("button", { name: t("email.actions.sendCode") }));

    expect(await screen.findByText(t("email.errors.invalid"))).toBeInTheDocument();
    expect(codeCount).toBe(0);
  });

  it("rejects the current email client-side before any network traffic", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.type(screen.getByLabelText(t("email.fields.newEmail")), CURRENT_EMAIL);
    await user.click(screen.getByRole("button", { name: t("email.actions.sendCode") }));

    expect(await screen.findByText(t("email.errors.sameEmail"))).toBeInTheDocument();
    expect(codeCount).toBe(0);
  });

  it("requests the identity code and enables the code field", async () => {
    const user = userEvent.setup();
    renderCard();

    const codeField = screen.getByLabelText(t("email.fields.code"));
    expect(codeField).toBeDisabled();

    await requestCode(user);

    expect(codeCount).toBe(1);
    expect(codeField).toBeEnabled();
    expect(screen.getByRole("button", { name: t("email.actions.resendCode") })).toBeInTheDocument();
    expect(screen.getByText(t("email.fields.codeHint"))).toBeInTheDocument();
  });

  it("posts the new email with the code and shows the pending-confirmation success", async () => {
    const user = userEvent.setup();
    renderCard();

    await requestCode(user);
    await user.type(screen.getByLabelText(t("email.fields.code")), "123456");
    await user.click(screen.getByRole("button", { name: t("email.submit") }));

    expect(await screen.findByRole("alert")).toHaveTextContent(t("email.successPending"));
    expect(changeEmailCount).toBe(1);
    expect(changeEmailBody).toEqual({ email: "nueva@countergank.com", code: "123456" });
  });

  it("maps the email-taken conflict to a field error", async () => {
    server.use(
      http.post(CHANGE_EMAIL_URL, () => {
        changeEmailCount += 1;

        return HttpResponse.json(
          { statusCode: 409, code: "UA-COM-004", message: "email taken", traceId: "t-1" },
          { status: 409 },
        );
      }),
    );
    const user = userEvent.setup();
    renderCard();

    await requestCode(user);
    await user.type(screen.getByLabelText(t("email.fields.code")), "123456");
    await user.click(screen.getByRole("button", { name: t("email.submit") }));

    expect(await screen.findByText(t("email.errors.taken"))).toBeInTheDocument();
    expect(changeEmailCount).toBe(1);
  });

  it("maps an invalid or expired code to a field error", async () => {
    server.use(
      http.post(CHANGE_EMAIL_URL, () => {
        changeEmailCount += 1;

        return HttpResponse.json(
          { statusCode: 401, code: "UA-AUTH-010", message: "invalid code", traceId: "t-2" },
          { status: 401 },
        );
      }),
    );
    const user = userEvent.setup();
    renderCard();

    await requestCode(user);
    await user.type(screen.getByLabelText(t("email.fields.code")), "999999");
    await user.click(screen.getByRole("button", { name: t("email.submit") }));

    expect(await screen.findByText(t("email.errors.codeInvalid"))).toBeInTheDocument();
    expect(changeEmailCount).toBe(1);
  });

  it("keeps submit disabled until the code was requested", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.type(screen.getByLabelText(t("email.fields.newEmail")), "nueva@countergank.com");

    expect(screen.getByRole("button", { name: t("email.submit") })).toBeDisabled();
    expect(screen.getByLabelText(t("email.fields.code"))).toBeDisabled();
    expect(changeEmailCount).toBe(0);
  });
});
