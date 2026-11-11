import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { userQueryKey } from "./hooks/use-user";
import { UsersDetailPage } from "./users-detail-page";

const USERS_URL = "https://test.invalid/admin/users";
const USER_URL = `${USERS_URL}/u1`;
const USER_ACTIVE_URL = `${USER_URL}/active`;
const USER_UNLOCK_URL = `${USER_URL}/unlock`;

const tUsers = i18n.getFixedT(null, "users");
const tCommon = i18n.getFixedT(null, "common");

const USER = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  userName: "ada",
  role: "admin",
  createdAt: "2024-06-01T10:00:00.000Z",
  updatedAt: "2024-06-02T10:00:00.000Z",
  isActive: true,
  lockedUntil: null,
  failedLoginAttempts: 0,
  emailVerified: true,
  hasPendingEmailChange: false,
  hasPendingPasswordReset: false,
};

const dateTimeFormatter = {
  date: new Intl.DateTimeFormat(i18n.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
  time: new Intl.DateTimeFormat(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }),
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  return `${dateTimeFormatter.date.format(date)} · ${dateTimeFormatter.time.format(date)}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function accountStatusValue(term: string): string | null {
  const row = screen.getByText(term).closest("div");

  return row === null ? null : within(row).getByRole("definition").textContent;
}

const ADMIN_PROFILE = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  role: "admin",
  permissions: ["*"],
};

const server = setupServer(http.get(USER_URL, () => HttpResponse.json(USER)));

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: "ada@example.com",
      userName: "ada",
      name: "Ada",
      lastName: "Lovelace",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
});

afterEach(() => {
  toast.dismiss();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(permissionsQueryKey, ADMIN_PROFILE);

  const view = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/app/users/u1"]}>
          <Routes>
            <Route path="/app/users/:id" element={<UsersDetailPage />} />
            <Route path="/app/users" element={<p>users-list</p>} />
            <Route path="/app/users/:id/edit" element={<p>edit-form</p>} />
          </Routes>
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { client, ...view };
}

describe("user detail — loaded user", () => {
  it("renders the seven artboard section headings", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: tUsers("detail.title"), level: 1 }),
    ).toBeInTheDocument();

    for (const key of [
      "profile.title",
      "permissions.title",
      "sessions.title",
      "adminActions.title",
      "accountStatus.title",
      "activity.title",
    ] as const) {
      expect(
        screen.getByRole("heading", { name: tUsers(`detail.${key}`), level: 2 }),
      ).toBeInTheDocument();
    }
  });

  it("renders the real profile values from the fixture (S2, S3)", async () => {
    renderPage();

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("@ada · ada@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("admin")).toHaveLength(2);
    expect(screen.getByText(tUsers("detail.status.active"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: tUsers("detail.actions.edit") })).toHaveAttribute(
      "href",
      "/app/users/u1/edit",
    );

    expect(screen.getByText(tUsers("detail.fields.name"))).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.lastName"))).toBeInTheDocument();
    expect(screen.getByText("Lovelace")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.userName"))).toBeInTheDocument();
    expect(screen.getByText("ada")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.email"))).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.role"))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.createdAt"))).toBeInTheDocument();
    expect(screen.getByText(formatDateTime(USER.createdAt))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.updatedAt"))).toBeInTheDocument();
    expect(screen.getByText(formatDateTime(USER.updatedAt))).toBeInTheDocument();
  });

  it("renders the real session rows with lockedUntil and failedLoginAttempts (S5)", async () => {
    server.use(
      http.get(USER_URL, () =>
        HttpResponse.json({
          ...USER,
          isActive: false,
          lockedUntil: "2024-06-03T10:00:00.000Z",
          failedLoginAttempts: 4,
        }),
      ),
    );
    renderPage();

    expect(await screen.findByText(formatDateTime("2024-06-03T10:00:00.000Z"))).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.status.inactive"))).toBeInTheDocument();
  });

  it("renders the account status states from the user fields", async () => {
    renderPage();
    await screen.findByText("Ada Lovelace");

    expect(accountStatusValue(tUsers("detail.accountStatus.verification"))).toBe(
      tUsers("list.verification.verified"),
    );
    expect(accountStatusValue(tUsers("detail.accountStatus.pendingEmail"))).toBe(
      tUsers("detail.accountStatus.no"),
    );
    expect(accountStatusValue(tUsers("detail.accountStatus.passwordReset"))).toBe(
      tUsers("detail.accountStatus.no"),
    );
  });

  it("renders unverified together with pending email change and password reset", async () => {
    server.use(
      http.get(USER_URL, () =>
        HttpResponse.json({
          ...USER,
          emailVerified: false,
          hasPendingEmailChange: true,
          hasPendingPasswordReset: true,
        }),
      ),
    );
    renderPage();
    await screen.findByText("Ada Lovelace");

    expect(accountStatusValue(tUsers("detail.accountStatus.verification"))).toBe(
      tUsers("list.verification.pending"),
    );
    expect(accountStatusValue(tUsers("detail.accountStatus.pendingEmail"))).toBe(
      tUsers("detail.accountStatus.yes"),
    );
    expect(accountStatusValue(tUsers("detail.accountStatus.passwordReset"))).toBe(
      tUsers("detail.accountStatus.yes"),
    );
  });

  it("renders the sections without an endpoint as placeholders and keeps the toggle wired (S4–S8)", async () => {
    renderPage();
    await screen.findByText("Ada Lovelace");

    expect(screen.getAllByText("—")).toHaveLength(8);

    const pending = tCommon("ui.list.pending");
    for (const key of ["resetPassword", "resendVerification", "changeEmail", "delete"] as const) {
      const button = screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers(`detail.adminActions.${key}`))} `),
      });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("title", expect.stringContaining(pending));
    }
    const toggle = screen.getByRole("button", {
      name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.deactivate"))}`),
    });
    expect(toggle).toBeEnabled();
    expect(screen.getByRole("button", { name: tUsers("detail.sessions.closeAll") })).toBeDisabled();
    expect(screen.getByRole("button", { name: tUsers("detail.activity.viewAll") })).toBeDisabled();
  });

  it("opens the confirmation and toggles the active flag from the detail (COU-293 S1, S7, S9)", async () => {
    sessionStore.setState(initialSessionState);
    sessionStore.getState().startSession({
      user: {
        id: "admin-9",
        email: "root@example.com",
        userName: "root",
        name: "Root",
        lastName: "Admin",
      },
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });
    let patchCount = 0;
    let patchBodyText: string | null = null;
    server.use(
      http.patch(USER_ACTIVE_URL, async ({ request }) => {
        patchCount += 1;
        patchBodyText = await request.text();

        return HttpResponse.json({ ...USER, isActive: false });
      }),
      http.get(USER_URL, () =>
        HttpResponse.json({ ...USER, isActive: patchCount > 0 ? false : USER.isActive }),
      ),
    );
    const { client } = renderPage();
    const user = userEvent.setup();
    await screen.findByText("Ada Lovelace");

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.deactivate"))}`),
      }),
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("active.confirmTitle"));

    await user.click(within(dialog).getByRole("button", { name: tUsers("active.deactivate") }));

    expect(await screen.findByText(tUsers("active.success"))).toBeInTheDocument();
    expect(patchCount).toBe(1);
    expect(patchBodyText).toBe("");
    await waitFor(() => {
      expect(client.getQueryData(userQueryKey("u1"))).toMatchObject({ isActive: false });
    });
  });

  it("labels the toggle row activate for an inactive user (COU-293 S5)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, isActive: false })));
    renderPage();

    expect(
      await screen.findByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("active.activate"))}`),
      }),
    ).toBeEnabled();
  });

  it("offers no unlock action for an unlocked user (S2)", async () => {
    renderPage();
    await screen.findByText("Ada Lovelace");

    expect(
      screen.queryByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.unlock"))}`),
      }),
    ).not.toBeInTheDocument();
  });

  it("unlocks a locked account from the detail with confirmation (S1, S2, S5)", async () => {
    const LOCKED_USER = {
      ...USER,
      lockedUntil: new Date(Date.now() + 10 * 60_000).toISOString(),
      failedLoginAttempts: 3,
    };
    let patchCount = 0;
    let patchBodyText: string | null = null;
    server.use(
      http.get(USER_URL, () =>
        HttpResponse.json(patchCount > 0 ? { ...LOCKED_USER, lockedUntil: null } : LOCKED_USER),
      ),
      http.patch(USER_UNLOCK_URL, async ({ request }) => {
        patchCount += 1;
        patchBodyText = await request.text();

        return HttpResponse.json({ message: "ok-unlocked", userId: "u1" });
      }),
    );
    const { client } = renderPage();
    const user = userEvent.setup();
    await screen.findByText("Ada Lovelace");

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.unlock"))}`),
      }),
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("unlock.confirmTitle"));

    await user.click(within(dialog).getByRole("button", { name: tUsers("unlock.action") }));

    expect(await screen.findByText("ok-unlocked")).toBeInTheDocument();
    expect(patchCount).toBe(1);
    expect(patchBodyText).toBe("");
    await waitFor(() => {
      expect(client.getQueryData(userQueryKey("u1"))).toMatchObject({ lockedUntil: null });
    });
  });

  it("offers the edit link and the way back to the list (S5)", async () => {
    renderPage();

    const editLink = await screen.findByRole("link", { name: tUsers("detail.actions.edit") });
    expect(editLink).toHaveAttribute("href", "/app/users/u1/edit");

    const backLink = screen.getByRole("link", { name: tUsers("detail.back") });
    expect(backLink).toHaveAttribute("href", "/app/users");
  });
});

describe("user detail — failures", () => {
  it("shows the dedicated not-found view instead of the generic error on 404 (S8)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({}, { status: 404 })));
    renderPage();

    expect(await screen.findByText(tUsers("detail.notFound"))).toBeInTheDocument();

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: tCommon("error.retry") })).toBeNull();
    expect(screen.queryByRole("link", { name: tUsers("detail.actions.edit") })).toBeNull();
  });

  it("shows the generic error and recovers with retry (S8)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({}, { status: 500 })));
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tCommon("error.dataFetchTitle"));
    expect(screen.queryByText(tUsers("detail.notFound"))).toBeNull();

    server.use(http.get(USER_URL, () => HttpResponse.json(USER)));

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tCommon("error.retry") }));

    expect(await screen.findByText("ada@example.com")).toBeInTheDocument();
  });

  it("replaces the loaded detail with the not-found view when a refetch answers 404 (S8)", async () => {
    const { client } = renderPage();

    expect(await screen.findByText("ada@example.com")).toBeInTheDocument();

    server.use(http.get(USER_URL, () => HttpResponse.json({}, { status: 404 })));
    await client.refetchQueries({ queryKey: userQueryKey("u1") });

    expect(await screen.findByText(tUsers("detail.notFound"))).toBeInTheDocument();
    expect(screen.queryByText("ada@example.com")).toBeNull();
    expect(screen.queryByText(tUsers("detail.fields.email"))).toBeNull();
    expect(screen.queryByRole("link", { name: tUsers("detail.actions.edit") })).toBeNull();
  });

  it("has no axe violations on the loaded page (S8)", async () => {
    const { container } = renderPage();
    await screen.findByText("ada@example.com");

    expect(await axe(container)).toHaveNoViolations();
  });
});
