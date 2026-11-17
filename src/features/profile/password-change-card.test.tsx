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

import { PasswordChangeCard } from "./password-change-card";

const CHANGE_PASSWORD_URL = "https://test.invalid/users/change-password";
const REFRESH_URL = "https://test.invalid/auth/refresh";

const CURRENT_PASSWORD = "ViejaS3gura!";
const NEW_PASSWORD = "NuevaS3gura!";

const t = i18n.getFixedT(null, "profile");

let changePasswordBody: { currentPassword?: string; newPassword?: string } | null = null;
let changePasswordCount = 0;

const server = setupServer(
  http.post(REFRESH_URL, () =>
    HttpResponse.json({ accessToken: "access-2", refreshToken: "refresh-2" }),
  ),
  http.post(CHANGE_PASSWORD_URL, async ({ request }) => {
    changePasswordBody = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    changePasswordCount += 1;

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
  changePasswordBody = null;
  changePasswordCount = 0;
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
        <PasswordChangeCard />
        <Toaster />
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { container, client };
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  current: string,
  newPassword: string,
  confirm: string,
) {
  if (current !== "") {
    await user.type(screen.getByLabelText(t("password.fields.current")), current);
  }
  await user.type(screen.getByLabelText(t("password.fields.new")), newPassword);
  await user.type(screen.getByLabelText(t("password.fields.confirm")), confirm);
  await user.click(screen.getByRole("button", { name: t("password.submit") }));
}

describe("PasswordChangeCard", () => {
  it("renders the card with the three fields, the rules checklist and no axe violations", async () => {
    const { container } = renderCard();

    expect(
      screen.getByRole("heading", { name: t("password.title"), level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t("password.fields.current"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("password.fields.new"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("password.fields.confirm"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("password.submit") })).toBeInTheDocument();
    expect(screen.getByText(t("password.rules.label"))).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks the api password rules in the checklist while typing", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.type(screen.getByLabelText(t("password.fields.new")), "abc");

    const items = screen.getAllByRole("listitem").map((item) => item.textContent);

    expect(items).toEqual([
      t("password.rules.length"),
      t("password.rules.lowercase"),
      t("password.rules.uppercase"),
      t("password.rules.digit"),
      t("password.rules.special"),
      t("password.rules.unique"),
    ]);
  });

  it("requires the current password before any network traffic", async () => {
    const user = userEvent.setup();
    renderCard();

    await fillAndSubmit(user, "", NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText(t("errors.fieldRequired"))).toBeInTheDocument();
    expect(changePasswordCount).toBe(0);
  });

  it("rejects a new password that breaks the api rules before any network traffic", async () => {
    const user = userEvent.setup();
    renderCard();

    await fillAndSubmit(user, CURRENT_PASSWORD, "debil", "debil");

    expect(await screen.findByLabelText(t("password.fields.new"))).toHaveAccessibleDescription(
      t("password.rules.length"),
    );
    expect(screen.getByLabelText(t("password.fields.new"))).toHaveAttribute("aria-invalid", "true");
    expect(changePasswordCount).toBe(0);
  });

  it("rejects a confirmation that does not match before any network traffic", async () => {
    const user = userEvent.setup();
    renderCard();

    await fillAndSubmit(user, CURRENT_PASSWORD, NEW_PASSWORD, "DistintaS3gura!");

    expect(await screen.findByText(t("password.errors.mismatch"))).toBeInTheDocument();
    expect(changePasswordCount).toBe(0);
  });

  it("posts the change, clears the form and raises the success toast", async () => {
    const user = userEvent.setup();
    renderCard();

    await fillAndSubmit(user, CURRENT_PASSWORD, NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText(t("password.success"))).toBeInTheDocument();
    expect(changePasswordCount).toBe(1);
    expect(changePasswordBody).toEqual({
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });
    expect(screen.getByLabelText(t("password.fields.current"))).toHaveValue("");
    expect(screen.getByLabelText(t("password.fields.new"))).toHaveValue("");
    expect(screen.getByLabelText(t("password.fields.confirm"))).toHaveValue("");
  });

  it("maps the wrong-current-password rejection to a field error on the current password only", async () => {
    server.use(
      http.post(CHANGE_PASSWORD_URL, () => {
        changePasswordCount += 1;

        return HttpResponse.json(
          {
            statusCode: 400,
            code: "UA-USR-003",
            message: "current password is incorrect",
            traceId: "t-1",
          },
          { status: 400 },
        );
      }),
    );
    const user = userEvent.setup();
    renderCard();

    await fillAndSubmit(user, "IncorrectaS3!", NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText(t("password.errors.currentIncorrect"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("password.fields.current"))).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(t("password.fields.new"))).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    expect(screen.getByLabelText(t("password.fields.confirm"))).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    expect(changePasswordCount).toBe(1);
    expect(screen.queryByText(t("password.errors.changeFailure"))).not.toBeInTheDocument();
  });

  it("raises the generic failure toast for any other rejection", async () => {
    server.use(
      http.post(CHANGE_PASSWORD_URL, () => {
        changePasswordCount += 1;

        return HttpResponse.json(
          { statusCode: 500, message: "database exploded", traceId: "t-2" },
          { status: 500 },
        );
      }),
    );
    const user = userEvent.setup();
    renderCard();

    await fillAndSubmit(user, CURRENT_PASSWORD, NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText(t("password.errors.changeFailure"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("password.fields.current"))).toHaveValue(CURRENT_PASSWORD);
    expect(changePasswordCount).toBe(1);
  });
});
