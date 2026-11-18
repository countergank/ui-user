import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay } from "msw";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/features/users/users-detail/format";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { SessionsPage } from "./sessions-page";

const SESSIONS_URL = "https://test.invalid/auth/sessions";
const LOGOUT_ALL_URL = "https://test.invalid/auth/logout-all";

const t = i18n.getFixedT(null, "sessions");
const tCommon = i18n.getFixedT(null, "common");

const CURRENT_SESSION = {
  id: "session-1",
  device: "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
  ip: "10.0.0.1",
  issuedAt: "2026-11-01T10:00:00.000Z",
  lastAccessAt: "2026-11-18T12:00:00.000Z",
  expiresAt: "2026-11-08T10:00:00.000Z",
};

const OTHER_SESSION = {
  id: "session-2",
  device: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605.1.15",
  ip: null,
  issuedAt: "2026-11-10T09:00:00.000Z",
  lastAccessAt: "2026-11-11T09:00:00.000Z",
  expiresAt: "2026-11-17T09:00:00.000Z",
};

let deleteCount = 0;
let deleteTarget: string | null = null;
let logoutAllCount = 0;
let revokedIds: string[] = [];

const server = setupServer(
  http.get(SESSIONS_URL, () =>
    HttpResponse.json(
      [CURRENT_SESSION, OTHER_SESSION].filter((session) => !revokedIds.includes(session.id)),
    ),
  ),
  http.delete(`${SESSIONS_URL}/:sessionId`, ({ params }) => {
    deleteCount += 1;
    deleteTarget = String(params.sessionId);
    revokedIds = [...revokedIds, deleteTarget];

    return HttpResponse.json({ message: "session revoked" });
  }),
  http.post(LOGOUT_ALL_URL, () => {
    logoutAllCount += 1;

    return HttpResponse.json({ message: "logged out everywhere" });
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
    sessionId: "session-1",
  });
});

afterEach(() => {
  toast.dismiss();
  server.resetHandlers();
  deleteCount = 0;
  deleteTarget = null;
  logoutAllCount = 0;
  revokedIds = [];
  sessionStore.setState(initialSessionState);
});

afterAll(() => {
  server.close();
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/app/sessions"]}>
          <SessionsPage />
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { container, client };
}

async function waitForSessions() {
  await screen.findByText(CURRENT_SESSION.device);

  return userEvent.setup();
}

function rowOf(text: string): HTMLElement {
  const row = screen.getByText(text).closest('[data-testid="session-row"]');
  if (row === null) {
    throw new Error(`no session row contains ${text}`);
  }

  return row as HTMLElement;
}

describe("sessions page — table (S1, S2)", () => {
  it("renders the page header with the close-all action and the table headers", async () => {
    const { container } = renderPage();
    await waitForSessions();

    expect(screen.getByRole("heading", { level: 1, name: t("view.heading") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("actions.closeAll") })).toBeInTheDocument();

    const table = screen.getByRole("table", { name: t("list.title") });
    for (const header of [
      t("list.columns.device"),
      t("list.columns.ip"),
      t("list.columns.lastAccess"),
      t("list.columns.action"),
    ]) {
      expect(within(table).getByRole("columnheader", { name: header })).toBeInTheDocument();
    }

    expect(await axe(container)).toHaveNoViolations();
  });

  it("distinguishes the current session with the badge and no revoke action", async () => {
    renderPage();
    await waitForSessions();

    const current = rowOf(CURRENT_SESSION.device);
    const other = rowOf(OTHER_SESSION.device);

    expect(current).toHaveAttribute("data-current", "true");
    expect(within(current).getByText(t("list.currentBadge"))).toBeInTheDocument();
    expect(within(current).queryByRole("button", { name: t("actions.revoke") })).toBeNull();

    expect(other).toHaveAttribute("data-current", "false");
    expect(within(other).getByRole("button", { name: t("actions.revoke") })).toBeInTheDocument();
  });

  it("shows the current session dates, the ip and the no-value marker", async () => {
    renderPage();
    await waitForSessions();

    const current = rowOf(CURRENT_SESSION.device);
    expect(current).toHaveTextContent("10.0.0.1");
    expect(current).toHaveTextContent(
      t("list.startedAt", { date: formatDate(CURRENT_SESSION.issuedAt, i18n.language) }),
    );
    expect(current).toHaveTextContent(
      t("list.expiresAt", { date: formatDate(CURRENT_SESSION.expiresAt, i18n.language) }),
    );

    const other = rowOf(OTHER_SESSION.device);
    expect(other).toHaveTextContent("—");
  });

  it("shows the active device count footer", async () => {
    renderPage();
    await waitForSessions();

    expect(screen.getByText(t("list.footer", { count: 2 }))).toBeInTheDocument();
  });
});

describe("sessions page — revoke (S3)", () => {
  it("asks for confirmation before revoking another session, and cancels without deleting", async () => {
    renderPage();
    const user = await waitForSessions();

    await user.click(
      within(rowOf(OTHER_SESSION.device)).getByRole("button", { name: t("actions.revoke") }),
    );

    expect(
      screen.getByRole("alertdialog", { name: t("confirm.revoke.title") }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: t("actions.cancel") }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(deleteCount).toBe(0);
  });

  it("revokes another session after confirming, toasts and drops the row", async () => {
    renderPage();
    await waitForSessions();
    const user = userEvent.setup();

    await user.click(
      within(rowOf(OTHER_SESSION.device)).getByRole("button", { name: t("actions.revoke") }),
    );
    await user.click(screen.getByRole("button", { name: t("confirm.revoke.action") }));

    expect(await screen.findByText(t("success.revoked"))).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(OTHER_SESSION.device)).not.toBeInTheDocument();
    });
    expect(deleteCount).toBe(1);
    expect(deleteTarget).toBe("session-2");
    expect(sessionStore.getState().status).toBe("authenticated");
  });
});

describe("sessions page — close all (S4)", () => {
  it("asks for confirmation before closing every session and cancels without posting", async () => {
    renderPage();
    await waitForSessions();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: t("actions.closeAll") }));

    expect(
      screen.getByRole("alertdialog", { name: t("confirm.closeAll.title") }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: t("actions.cancel") }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(logoutAllCount).toBe(0);
    expect(sessionStore.getState().status).toBe("authenticated");
  });

  it("keeps the session and surfaces the failure when logout-all rejects", async () => {
    server.use(http.post(LOGOUT_ALL_URL, () => HttpResponse.json({}, { status: 500 })));
    renderPage();
    await waitForSessions();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: t("actions.closeAll") }));
    await user.click(screen.getByRole("button", { name: t("confirm.closeAll.action") }));

    expect(await screen.findByText(t("errors.closeAllFailure"))).toBeInTheDocument();
    expect(sessionStore.getState().status).toBe("authenticated");
  });
});

describe("sessions page — states (S6)", () => {
  it("shows a loading status while the sessions are in flight", async () => {
    server.use(
      http.get(SESSIONS_URL, async () => {
        await delay(50);

        return HttpResponse.json([CURRENT_SESSION, OTHER_SESSION]);
      }),
    );
    renderPage();

    expect(screen.getByText(t("view.loading"))).toBeInTheDocument();

    expect(await screen.findByText(CURRENT_SESSION.device)).toBeInTheDocument();
  });

  it("shows an empty state when there are no sessions", async () => {
    server.use(http.get(SESSIONS_URL, () => HttpResponse.json([])));
    renderPage();

    expect(await screen.findByText(t("list.empty"))).toBeInTheDocument();
  });

  it("shows the fetch error with retry and recovers", async () => {
    server.use(http.get(SESSIONS_URL, () => HttpResponse.json({}, { status: 500 })));
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(t("errors.fetchFailure"));

    server.use(http.get(SESSIONS_URL, () => HttpResponse.json([CURRENT_SESSION])));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tCommon("error.retry") }));

    expect(await screen.findByText(CURRENT_SESSION.device)).toBeInTheDocument();
  });
});
