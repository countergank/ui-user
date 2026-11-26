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
const USER_RESET_PASSWORD_URL = `${USER_URL}/reset-password`;
const USER_RESEND_VERIFICATION_URL = `${USER_URL}/resend-verification`;
const USER_CHANGE_EMAIL_URL = `${USER_URL}/change-email`;
const SESSIONS_URL = `${USER_URL}/sessions`;
const PERMISSIONS_CATALOG_URL = "https://test.invalid/permissions";

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
  permissions: ["user:read", "role:read"],
};

const PERMISSIONS_CATALOG = {
  data: [
    { name: "user:read", description: "Read users" },
    { name: "role:read", description: "Read roles" },
  ],
  total: 2,
  page: 1,
  limit: 100,
  totalPages: 1,
};

const SESSIONS = [
  {
    id: "s1",
    device: "Chrome on Windows",
    ip: "190.12.4.7",
    issuedAt: "2024-06-01T10:00:00.000Z",
    lastAccessAt: "2024-06-02T16:41:00.000Z",
    expiresAt: "2024-07-01T10:00:00.000Z",
  },
  {
    id: "s2",
    device: "Safari on iPhone",
    ip: "190.12.4.8",
    issuedAt: "2024-06-01T12:00:00.000Z",
    lastAccessAt: "2024-06-01T12:05:00.000Z",
    expiresAt: "2024-07-01T12:00:00.000Z",
  },
];

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

const RealImage = window.Image;

class LoadedAvatarImage {
  complete = false;
  naturalWidth = 0;
  #listeners = new Set<(event: unknown) => void>();

  addEventListener(_type: string, listener: (event: unknown) => void): void {
    this.#listeners.add(listener);
  }

  removeEventListener(_type: string, listener: (event: unknown) => void): void {
    this.#listeners.delete(listener);
  }

  set src(_value: string) {
    this.complete = true;
    this.naturalWidth = 64;
  }
}

const server = setupServer(
  http.get(USER_URL, () => HttpResponse.json(USER)),
  http.get(SESSIONS_URL, () => HttpResponse.json(SESSIONS)),
  http.get(PERMISSIONS_CATALOG_URL, () => HttpResponse.json(PERMISSIONS_CATALOG)),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
  window.Image = LoadedAvatarImage as unknown as typeof Image;
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
  window.Image = RealImage;
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

  it("shows the header initials when the user has no photo (113 S3)", async () => {
    const { container } = renderPage();
    await screen.findByText("Ada Lovelace");

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders the user photo in the header avatar when one exists (113 S3)", async () => {
    server.use(
      http.get(USER_URL, () =>
        HttpResponse.json({ ...USER, avatarUrl: "https://cdn.example/ada.png" }),
      ),
    );
    const { container } = renderPage();
    await screen.findByText("Ada Lovelace");

    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://cdn.example/ada.png");
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

  it("renders the effective permissions with readable labels (126 S1, S3)", async () => {
    renderPage();

    expect(await screen.findByText("Read users")).toBeInTheDocument();
    expect(screen.getByText("Read roles")).toBeInTheDocument();
    expect(screen.getByTitle("user:read")).toBeInTheDocument();
    expect(screen.getByTitle("role:read")).toBeInTheDocument();
    expect(screen.queryByText("user:read")).toBeNull();
  });

  it("falls back to the raw permission codes when the catalog is unavailable (126 S3)", async () => {
    server.use(http.get(PERMISSIONS_CATALOG_URL, () => HttpResponse.json({}, { status: 403 })));
    renderPage();

    expect(await screen.findByText("user:read")).toBeInTheDocument();
    expect(screen.getByText("role:read")).toBeInTheDocument();
    expect(screen.queryByText("Read users")).toBeNull();
  });

  it("shows the empty state for a user without permissions (126 S4)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, permissions: [] })));
    renderPage();

    expect(await screen.findByText(tUsers("detail.permissions.empty"))).toBeInTheDocument();
    expect(screen.queryByText("user:read")).toBeNull();
  });

  it("renders the full wildcard as a single all-permissions row (126 S5)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, permissions: ["*"] })));
    renderPage();

    expect(await screen.findByText(tUsers("detail.permissions.all"))).toBeInTheDocument();
    expect(screen.queryByText("*")).toBeNull();
  });

  it("renders a readable label for resource wildcards without a catalog entry (126 S5)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, permissions: ["user:*"] })));
    renderPage();

    expect(
      await screen.findByText(tUsers("detail.permissions.resourceWildcard", { resource: "user" })),
    ).toBeInTheDocument();
    expect(screen.queryByText("user:*")).toBeNull();
  });

  it("does not request the permission catalog without permission:read (126 S6)", async () => {
    let catalogRequests = 0;
    server.use(
      http.get(PERMISSIONS_CATALOG_URL, () => {
        catalogRequests += 1;
        return HttpResponse.json(PERMISSIONS_CATALOG);
      }),
    );
    const { client } = renderPage();
    client.setQueryData(permissionsQueryKey, {
      ...ADMIN_PROFILE,
      permissions: ["user:read"],
    });
    await screen.findByText("Ada Lovelace");

    expect(await screen.findByText("user:read")).toBeInTheDocument();
    expect(catalogRequests).toBe(0);
  });

  it("reports all permissions in the meta for the full wildcard instead of a count (126 S6)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, permissions: ["*"] })));
    renderPage();

    expect(await screen.findByText(tUsers("detail.permissions.all"))).toBeInTheDocument();
    expect(screen.queryByText(tUsers("detail.permissions.count", { count: 1 }))).toBeNull();
  });

  it("renders the remaining placeholders and keeps the toggle wired (S4–S8)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, emailVerified: false })));
    renderPage();
    await screen.findByText("Ada Lovelace");
    await screen.findByText(tUsers("detail.sessions.deviceCount", { count: 2 }));

    expect(screen.getAllByText("—")).toHaveLength(1);

    const deleteButton = screen.getByRole("button", {
      name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.delete"))} `),
    });
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute("title", tUsers("delete.selfBlocked"));
    expect(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.resetPassword"))} `),
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.resendVerification"))} `),
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.changeEmail"))} `),
      }),
    ).toBeEnabled();
    const toggle = screen.getByRole("button", {
      name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.deactivate"))}`),
    });
    expect(toggle).toBeEnabled();
    expect(screen.getByRole("button", { name: tUsers("detail.sessions.closeAll") })).toBeEnabled();
    expect(screen.getByRole("button", { name: tUsers("detail.activity.viewAll") })).toBeDisabled();
  });

  it("deletes the user from the detail and returns to the list (53 S1, S7)", async () => {
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
    let deleteCount = 0;
    server.use(
      http.delete(USER_URL, () => {
        deleteCount += 1;

        return HttpResponse.json({ message: "ok-deleted", userId: "u1" });
      }),
    );
    renderPage();
    const user = userEvent.setup();
    const deleteButton = await screen.findByRole("button", {
      name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.delete"))} `),
    });
    expect(deleteButton).toBeEnabled();

    await user.click(deleteButton);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("delete.confirmTitle"));
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeDisabled();

    await user.type(within(dialog).getByRole("textbox"), "ada@example.com");
    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.action") }));

    expect(deleteCount).toBe(1);
    expect(await screen.findByText("ok-deleted")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("users-list")).toBeInTheDocument();
    });
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

  it("keeps the photo after the toggle active echo omits avatarUrl (113 S3)", async () => {
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
    server.use(
      http.get(USER_URL, () =>
        HttpResponse.json({ ...USER, avatarUrl: "https://cdn.example/ada.png" }),
      ),
      http.patch(USER_ACTIVE_URL, () => HttpResponse.json({ ...USER, isActive: false })),
    );
    const { container } = renderPage();
    const user = userEvent.setup();
    await screen.findByText("Ada Lovelace");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://cdn.example/ada.png");

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.deactivate"))}`),
      }),
    );
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: tUsers("active.deactivate") }));

    expect(await screen.findByText(tUsers("active.success"))).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelector("img")?.getAttribute("src")).toBe(
        "https://cdn.example/ada.png",
      );
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

  it("resets the password from the detail with confirmation (127 S1, S5)", async () => {
    let postCount = 0;
    server.use(
      http.get(USER_URL, () =>
        HttpResponse.json(postCount > 0 ? { ...USER, hasPendingPasswordReset: true } : USER),
      ),
      http.post(USER_RESET_PASSWORD_URL, () => {
        postCount += 1;

        return HttpResponse.json({ message: "ok-reset", userId: "u1" });
      }),
    );
    const { client } = renderPage();
    const user = userEvent.setup();
    await screen.findByText("Ada Lovelace");

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.resetPassword"))} `),
      }),
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("resetPassword.confirmTitle"));

    await user.click(within(dialog).getByRole("button", { name: tUsers("resetPassword.action") }));

    expect(await screen.findByText("ok-reset")).toBeInTheDocument();
    expect(postCount).toBe(1);
    await waitFor(() => {
      expect(client.getQueryData(userQueryKey("u1"))).toMatchObject({
        hasPendingPasswordReset: true,
      });
    });
  });

  it("disables the resend-verification row for an already verified user (127 S6)", async () => {
    renderPage();
    await screen.findByText("Ada Lovelace");

    expect(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.resendVerification"))} `),
      }),
    ).toBeDisabled();
  });

  it("keeps the resend-verification row enabled for an unverified user (127 S6)", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({ ...USER, emailVerified: false })));
    renderPage();
    await screen.findByText("Ada Lovelace");

    expect(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.resendVerification"))} `),
      }),
    ).toBeEnabled();
  });

  it("resends the verification email from the detail with confirmation (127 S2, S5)", async () => {
    server.use(
      http.get(USER_URL, () => HttpResponse.json({ ...USER, emailVerified: false })),
      http.post(USER_RESEND_VERIFICATION_URL, () =>
        HttpResponse.json({ message: "ok-resent", userId: "u1" }),
      ),
    );
    renderPage();
    const user = userEvent.setup();
    await screen.findByText("Ada Lovelace");

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.resendVerification"))} `),
      }),
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("resendVerification.confirmTitle"));
    expect(dialog).toHaveTextContent("ada@example.com");

    await user.click(
      within(dialog).getByRole("button", { name: tUsers("resendVerification.action") }),
    );

    expect(await screen.findByText("ok-resent")).toBeInTheDocument();
  });

  it("requests an email change from the detail and offers the pending cancel (127 S3, S5)", async () => {
    server.use(
      http.get(USER_URL, () => HttpResponse.json({ ...USER, hasPendingEmailChange: true })),
      http.post(USER_CHANGE_EMAIL_URL, () =>
        HttpResponse.json({ message: "ok-change-email", userId: "u1" }),
      ),
      http.delete(USER_CHANGE_EMAIL_URL, () => HttpResponse.json({ message: "ok-cancel-email" })),
    );
    renderPage();
    const user = userEvent.setup();
    await screen.findByText("Ada Lovelace");

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(tUsers("detail.adminActions.changeEmail"))} `),
      }),
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("changeEmail.confirmTitle"));
    expect(dialog).toHaveTextContent(tUsers("changeEmail.pendingTitle"));

    await user.type(screen.getByLabelText(tUsers("changeEmail.label")), "newada@example.com");
    await user.click(within(dialog).getByRole("button", { name: tUsers("changeEmail.action") }));

    expect(await screen.findByText("ok-change-email")).toBeInTheDocument();
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
