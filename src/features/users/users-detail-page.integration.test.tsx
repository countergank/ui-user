import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { userQueryKey } from "./hooks/use-user";
import { UsersDetailPage } from "./users-detail-page";

const USERS_URL = "https://test.invalid/admin/users";
const USER_URL = `${USERS_URL}/u1`;

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
};

const dateFormatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });

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
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { client, ...view };
}

describe("user detail — loaded user", () => {
  it("shows every UserDTO field with its term (S4, S8)", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: tUsers("detail.title"), level: 1 }),
    ).toBeInTheDocument();

    expect(await screen.findByText(tUsers("detail.fields.id"))).toBeInTheDocument();
    expect(screen.getByText("u1")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.name"))).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.lastName"))).toBeInTheDocument();
    expect(screen.getByText("Lovelace")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.email"))).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.userName"))).toBeInTheDocument();
    expect(screen.getByText("ada")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.role"))).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.status"))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.status.active"))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.createdAt"))).toBeInTheDocument();
    expect(screen.getByText(dateFormatter.format(new Date(USER.createdAt)))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.fields.updatedAt"))).toBeInTheDocument();
    expect(screen.getByText(dateFormatter.format(new Date(USER.updatedAt)))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.locked"))).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.failedAttempts"))).toBeInTheDocument();
  });

  it("shows the lock state and the failed attempts of a user the api reports locked (S2, S8)", async () => {
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

    expect(
      await screen.findByText(dateFormatter.format(new Date("2024-06-03T10:00:00.000Z"))),
    ).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(tUsers("detail.status.inactive"))).toBeInTheDocument();
  });

  it("offers the edit link and the way back to the list (S5)", async () => {
    renderPage();

    const editLink = await screen.findByRole("link", { name: tUsers("detail.actions.edit") });
    expect(editLink).toHaveAttribute("href", "/app/users/u1/edit");

    const backLink = screen.getByRole("link", { name: tUsers("detail.back") });
    expect(backLink).toHaveAttribute("href", "/app/users");
  });

  it("exposes no mutation action (S11)", async () => {
    renderPage();
    await screen.findByRole("heading", { name: tUsers("detail.title"), level: 1 });

    for (const key of ["activate", "deactivate", "unlock", "delete"] as const) {
      expect(screen.queryByRole("button", { name: tUsers(`list.actions.${key}`) })).toBeNull();
    }
    expect(screen.queryByRole("alertdialog")).toBeNull();
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
