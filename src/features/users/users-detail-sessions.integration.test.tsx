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

import { UsersDetailPage } from "./users-detail-page";
import { NO_VALUE } from "./users-detail/format";

const USER_URL = "https://test.invalid/admin/users/u1";
const SESSIONS_URL = `${USER_URL}/sessions`;
const REVOKE_URL = `${SESSIONS_URL}/s2`;
const LOGOUT_ALL_URL = `${USER_URL}/logout-all`;

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

function activeDevicesRow(): HTMLElement {
  return screen.getByText(tUsers("detail.sessions.activeDevices")).closest("div") as HTMLElement;
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

function renderPage(permissions: readonly string[] = ["*"]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(permissionsQueryKey, { ...ADMIN_PROFILE, permissions: [...permissions] });

  const view = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/app/users/u1"]}>
          <Routes>
            <Route path="/app/users/:id" element={<UsersDetailPage />} />
            <Route path="/app/users" element={<p>users-list</p>} />
          </Routes>
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { client, ...view };
}

describe("user detail — sessions and security", () => {
  it("populates last access and active sessions from the admin endpoint (125 S1)", async () => {
    renderPage();

    expect(
      await screen.findByText(tUsers("detail.sessions.deviceCount", { count: 2 })),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${formatDateTime(SESSIONS[0].lastAccessAt)} · ${SESSIONS[0].ip}`),
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getByText("Chrome on Windows")).toBeInTheDocument();
    expect(within(table).getByText("Safari on iPhone")).toBeInTheDocument();
    expect(within(table).getByText("190.12.4.7")).toBeInTheDocument();
    expect(within(table).getByText("190.12.4.8")).toBeInTheDocument();
  });

  it("shows the loading state while the sessions arrive (125 S5)", async () => {
    server.use(http.get(SESSIONS_URL, () => new Promise(() => undefined)));
    renderPage();

    await screen.findByText("Ada Lovelace");
    expect(await screen.findByText(tUsers("detail.sessions.loading"))).toBeInTheDocument();
    expect(activeDevicesRow()).toHaveTextContent(NO_VALUE);
  });

  it("shows the empty state when the user has no sessions (125 S5)", async () => {
    server.use(http.get(SESSIONS_URL, () => HttpResponse.json([])));
    renderPage();

    expect(await screen.findByText(tUsers("detail.sessions.empty"))).toBeInTheDocument();
    expect(
      screen.getByText(tUsers("detail.sessions.deviceCount", { count: 0 })),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("revokes one session through the confirmation dialog (125 S2)", async () => {
    let deleteCount = 0;
    server.use(
      http.delete(REVOKE_URL, () => {
        deleteCount += 1;
        return HttpResponse.json({ message: "ok" });
      }),
      http.get(SESSIONS_URL, () => HttpResponse.json(deleteCount > 0 ? [SESSIONS[0]] : SESSIONS)),
    );
    const user = userEvent.setup();
    renderPage();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    await user.click(
      within(rows[2]).getByRole("button", { name: tUsers("detail.sessions.actions.revoke") }),
    );

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("detail.sessions.confirm.revoke.title"));
    expect(dialog).toHaveTextContent(tUsers("detail.sessions.confirm.revoke.description"));

    await user.click(
      within(dialog).getByRole("button", { name: tUsers("detail.sessions.confirm.revoke.action") }),
    );

    expect(await screen.findByText(tUsers("detail.sessions.success.revoked"))).toBeInTheDocument();
    expect(deleteCount).toBe(1);
    await waitFor(() => {
      expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
    });
  });

  it("closes every session through the confirmation dialog (125 S3)", async () => {
    let postCount = 0;
    server.use(
      http.post(LOGOUT_ALL_URL, () => {
        postCount += 1;
        return HttpResponse.json({ message: "ok" });
      }),
      http.get(SESSIONS_URL, () => HttpResponse.json(postCount > 0 ? [] : SESSIONS)),
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole("table");
    await user.click(screen.getByRole("button", { name: tUsers("detail.sessions.closeAll") }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("detail.sessions.confirm.closeAll.title"));
    expect(dialog).toHaveTextContent(tUsers("detail.sessions.confirm.closeAll.description"));

    await user.click(
      within(dialog).getByRole("button", {
        name: tUsers("detail.sessions.confirm.closeAll.action"),
      }),
    );

    expect(
      await screen.findByText(tUsers("detail.sessions.success.closedAll")),
    ).toBeInTheDocument();
    expect(postCount).toBe(1);
    expect(await screen.findByText(tUsers("detail.sessions.empty"))).toBeInTheDocument();
  });

  it("shows the forbidden notice when the sessions read is rejected (125 S4)", async () => {
    server.use(
      http.get(SESSIONS_URL, () =>
        HttpResponse.json(
          { statusCode: 403, code: "UA-SEC-002", message: "forbidden", traceId: "t-1" },
          { status: 403 },
        ),
      ),
    );
    renderPage();

    const alert = await screen.findByRole("alert", undefined, { timeout: 5000 });
    expect(alert).toHaveTextContent(tUsers("detail.sessions.forbidden"));
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("skips the request and shows the notice without session:read (125 S4)", async () => {
    let reads = 0;
    server.use(
      http.get(SESSIONS_URL, () => {
        reads += 1;
        return HttpResponse.json(SESSIONS);
      }),
    );
    renderPage(["user:read"]);

    await screen.findByText("Ada Lovelace");
    expect(await screen.findByText(tUsers("detail.sessions.forbidden"))).toBeInTheDocument();
    expect(reads).toBe(0);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("detail.sessions.closeAll") })).toBeNull();
  });

  it("renders the table without actions when session:revoke is missing (125 S4)", async () => {
    renderPage(["user:read", "session:read"]);

    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).queryByRole("button")).toBeNull();
    expect(screen.queryByRole("button", { name: tUsers("detail.sessions.closeAll") })).toBeNull();
  });

  it("offers retry when the sessions fetch fails (125 S5)", async () => {
    server.use(http.get(SESSIONS_URL, () => HttpResponse.json({}, { status: 500 })));
    renderPage();

    const alert = await screen.findByRole("alert", undefined, { timeout: 5000 });
    expect(alert).toHaveTextContent(tUsers("detail.sessions.error"));
    expect(activeDevicesRow()).toHaveTextContent(NO_VALUE);

    server.use(http.get(SESSIONS_URL, () => HttpResponse.json(SESSIONS)));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tCommon("error.retry") }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("keeps the dialog open with the error inside when the revoke fails (125 S2, 134 H4)", async () => {
    server.use(http.delete(REVOKE_URL, () => HttpResponse.json({}, { status: 500 })));
    const user = userEvent.setup();
    renderPage();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    await user.click(
      within(rows[2]).getByRole("button", { name: tUsers("detail.sessions.actions.revoke") }),
    );
    const dialog = screen.getByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: tUsers("detail.sessions.confirm.revoke.action") }),
    );

    const error = await within(dialog).findByRole("alert");
    expect(error).toHaveTextContent(tUsers("detail.sessions.errors.revokeFailure"));
    expect(await screen.findAllByText(tUsers("detail.sessions.errors.revokeFailure"))).toHaveLength(
      2,
    );

    await user.click(
      within(dialog).getByRole("button", { name: tUsers("detail.sessions.actions.cancel") }),
    );
    expect(within(await screen.findByRole("table")).getAllByRole("row")).toHaveLength(3);
  });

  it("keeps the dialog open with the error inside when the logout-all fails (125 S3, 134 H1)", async () => {
    server.use(http.post(LOGOUT_ALL_URL, () => HttpResponse.json({}, { status: 500 })));
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole("table");
    await user.click(screen.getByRole("button", { name: tUsers("detail.sessions.closeAll") }));

    const dialog = screen.getByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", {
        name: tUsers("detail.sessions.confirm.closeAll.action"),
      }),
    );

    const error = await within(dialog).findByRole("alert");
    expect(error).toHaveTextContent(tUsers("detail.sessions.errors.closeAllFailure"));
    expect(
      await screen.findAllByText(tUsers("detail.sessions.errors.closeAllFailure")),
    ).toHaveLength(2);

    await user.click(
      within(dialog).getByRole("button", { name: tUsers("detail.sessions.actions.cancel") }),
    );
    expect(within(await screen.findByRole("table")).getAllByRole("row")).toHaveLength(3);
  });

  it("has no axe violations on the sessions table (125 S1–S5)", async () => {
    const { container } = renderPage();
    await screen.findByRole("table");

    expect(await axe(container)).toHaveNoViolations();
  });
});
