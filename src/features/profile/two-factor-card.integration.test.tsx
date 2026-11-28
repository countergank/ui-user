import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { TwoFactorCard } from "./two-factor-card";

const ENROLL_URL = "https://test.invalid/auth/2fa/enroll";
const ACTIVATE_URL = "https://test.invalid/auth/2fa/activate";
const REFRESH_URL = "https://test.invalid/auth/refresh";

const t = i18n.getFixedT(null, "profile");
const tCommon = i18n.getFixedT(null, "common");

const ENROLLMENT = {
  secret: "JBSWY3DPEHPK3PXP",
  otpauthUrl: "otpauth://totp/Countergank:mcabrera?secret=JBSWY3DPEHPK3PXP",
};

let enrollCount = 0;
let activateCount = 0;
let activateBody: { code?: string } | null = null;

const server = setupServer(
  http.post(REFRESH_URL, () =>
    HttpResponse.json({ accessToken: "access-2", refreshToken: "refresh-2" }),
  ),
  http.post(ENROLL_URL, () => {
    enrollCount += 1;

    return HttpResponse.json(ENROLLMENT);
  }),
  http.post(ACTIVATE_URL, async ({ request }) => {
    activateCount += 1;
    activateBody = (await request.json()) as { code?: string };

    return HttpResponse.json({ twoFactorEnabled: true });
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
      email: "mcabrera@countergank.com",
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
  enrollCount = 0;
  activateCount = 0;
  activateBody = null;
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
        <TwoFactorCard />
        <Toaster />
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { container };
}

async function enroll() {
  expect(await screen.findByText(ENROLLMENT.secret)).toBeInTheDocument();
}

async function goToConfirmStep(user: ReturnType<typeof userEvent.setup>) {
  if (screen.queryByLabelText(t("twoFactor.fields.code")) !== null) {
    return;
  }

  await user.click(screen.getByRole("button", { name: t("twoFactor.actions.continue") }));
}

async function submitCode(user: ReturnType<typeof userEvent.setup>, code: string) {
  await goToConfirmStep(user);
  await user.type(screen.getByLabelText(t("twoFactor.fields.code")), code);
  await user.click(screen.getByRole("button", { name: t("twoFactor.actions.activate") }));
}

describe("TwoFactorCard", () => {
  it("auto-enrolls on mount and renders the QR, the secret and the one-time warning", async () => {
    const { container } = renderCard();

    await enroll();

    const qr = screen.getByTestId("two-factor-qr");
    expect(qr).toHaveAttribute("role", "img");
    expect(qr.getAttribute("aria-label")).toBe(t("twoFactor.qrLabel"));
    expect(qr.querySelector("svg")).not.toBeNull();
    expect(screen.getByText(t("twoFactor.qrHint"))).toBeInTheDocument();
    expect(screen.getByText(t("twoFactor.secretLabel"))).toBeInTheDocument();
    expect(screen.getByText(t("twoFactor.secretWarning"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("twoFactor.copy") })).toBeInTheDocument();
    expect(screen.getByText(t("twoFactor.steps.scan"))).toBeInTheDocument();
    expect(screen.getByText(t("twoFactor.steps.confirm"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: t("twoFactor.actions.continue") }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(t("twoFactor.fields.code"))).toBeNull();
    expect(enrollCount).toBe(1);
    expect(container.querySelector('[data-testid="two-factor-qr"] svg path')).not.toBeNull();
  });

  it("moves to the confirm step and back keeping the enrollment", async () => {
    renderCard();
    const user = userEvent.setup();

    await enroll();
    await goToConfirmStep(user);

    expect(screen.getByLabelText(t("twoFactor.fields.code"))).toBeEnabled();
    expect(screen.queryByTestId("two-factor-qr")).toBeNull();

    await user.click(screen.getByRole("button", { name: t("twoFactor.actions.back") }));

    expect(screen.getByTestId("two-factor-qr")).toBeInTheDocument();
    expect(screen.getByText(ENROLLMENT.secret)).toBeInTheDocument();
    expect(screen.queryByLabelText(t("twoFactor.fields.code"))).toBeNull();
    expect(enrollCount).toBe(1);
  });

  it("copies the secret to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      renderCard();

      await enroll();
      await user.click(screen.getByRole("button", { name: t("twoFactor.copy") }));

      expect(writeText).toHaveBeenCalledWith(ENROLLMENT.secret);
      expect(
        await screen.findByRole("button", { name: t("twoFactor.copied") }),
      ).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });

  it("activates with the 6-digit code and shows the activated state", async () => {
    renderCard();
    const user = userEvent.setup();

    await enroll();
    await submitCode(user, "123456");

    expect(await screen.findByText(t("twoFactor.activated"))).toBeInTheDocument();
    expect(screen.queryByTestId("two-factor-qr")).toBeNull();
    expect(screen.queryByLabelText(t("twoFactor.fields.code"))).toBeNull();
    expect(activateCount).toBe(1);
    expect(activateBody).toEqual({ code: "123456" });
  });

  it("shows the catalog copy for an invalid code and stays retryable", async () => {
    server.use(
      http.post(ACTIVATE_URL, () => {
        activateCount += 1;

        return HttpResponse.json(
          { statusCode: 401, code: "UA-AUTH-013", message: "invalid code" },
          { status: 401 },
        );
      }),
    );
    renderCard();
    const user = userEvent.setup();

    await enroll();
    await submitCode(user, "999999");

    expect(await screen.findByTestId("two-factor-activate-error")).toHaveTextContent(
      tCommon("error.ua.UA-AUTH-013"),
    );
    expect(screen.queryByText(t("twoFactor.activated"))).toBeNull();

    server.use(
      http.post(ACTIVATE_URL, async ({ request }) => {
        activateCount += 1;
        activateBody = (await request.json()) as { code?: string };

        return HttpResponse.json({ twoFactorEnabled: true });
      }),
    );
    const code = screen.getByLabelText(t("twoFactor.fields.code"));
    await user.clear(code);
    await submitCode(user, "123456");

    expect(await screen.findByText(t("twoFactor.activated"))).toBeInTheDocument();
    expect(screen.queryByTestId("two-factor-activate-error")).toBeNull();
  });

  it("offers re-enrollment when the activation budget is exhausted", async () => {
    server.use(
      http.post(ACTIVATE_URL, () => {
        activateCount += 1;

        return HttpResponse.json(
          { statusCode: 400, code: "UA-AUTH-012", message: "no pending enrollment" },
          { status: 400 },
        );
      }),
    );
    renderCard();
    const user = userEvent.setup();

    await enroll();
    await submitCode(user, "123456");

    expect(await screen.findByText(tCommon("error.ua.UA-AUTH-012"))).toBeInTheDocument();
    expect(screen.getByText(t("twoFactor.reenrollHint"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: t("twoFactor.actions.reenroll") }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(t("twoFactor.fields.code"))).toBeNull();
    expect(activateCount).toBe(1);

    await user.click(screen.getByRole("button", { name: t("twoFactor.actions.reenroll") }));

    expect(await screen.findByText(ENROLLMENT.secret)).toBeInTheDocument();
    expect(enrollCount).toBe(2);
    expect(screen.queryByText(tCommon("error.ua.UA-AUTH-012"))).toBeNull();
  });

  it("rejects a non-6-digit code client-side before any network traffic", async () => {
    renderCard();
    const user = userEvent.setup();

    await enroll();
    await submitCode(user, "12");

    expect(await screen.findByText(t("twoFactor.errors.codeInvalid"))).toBeInTheDocument();
    expect(activateCount).toBe(0);
    expect(activateBody).toBeNull();
  });

  it("surfaces an enrollment failure as an inline catalog error", async () => {
    server.use(
      http.post(ENROLL_URL, () =>
        HttpResponse.json({ statusCode: 500, message: "boom" }, { status: 500 }),
      ),
    );
    renderCard();
    const user = userEvent.setup();

    expect(await screen.findByTestId("two-factor-enroll-error")).toHaveTextContent(
      tCommon("error.family.server"),
    );
    expect(screen.queryByText(ENROLLMENT.secret)).toBeNull();

    server.use(
      http.post(ENROLL_URL, () => {
        enrollCount += 1;

        return HttpResponse.json(ENROLLMENT);
      }),
    );
    await user.click(screen.getByRole("button", { name: t("twoFactor.actions.retry") }));

    expect(await screen.findByText(ENROLLMENT.secret)).toBeInTheDocument();
  });

  it("has no axe violations in both enrollment steps", async () => {
    const { container } = renderCard();
    const user = userEvent.setup();

    await enroll();

    expect(await axe(container)).toHaveNoViolations();

    await goToConfirmStep(user);

    expect(await axe(container)).toHaveNoViolations();
  });
});
