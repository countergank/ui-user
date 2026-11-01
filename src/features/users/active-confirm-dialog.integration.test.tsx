import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { ActiveConfirmDialog } from "./components/active-confirm-dialog";
import { userQueryKey } from "./hooks/use-user";
import { USERS_QUERY_KEY } from "./hooks/use-users";
import type { UserDTO } from "./types";

const USERS_URL = "https://test.invalid/admin/users";
const USER_ACTIVE_URL = `${USERS_URL}/u1/active`;

const tUsers = i18n.getFixedT(null, "users");
const tCommon = i18n.getFixedT(null, "common");

function buildUser(overrides: Partial<UserDTO> = {}): UserDTO {
  return {
    id: "u1",
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    userName: "ada",
    role: "user",
    createdAt: "2024-06-01T10:00:00.000Z",
    updatedAt: "2024-06-01T10:00:00.000Z",
    isActive: true,
    lockedUntil: null,
    failedLoginAttempts: 0,
    ...overrides,
  };
}

let patchCount = 0;
let patchBodyText: string | null = null;

const server = setupServer(
  http.patch(USER_ACTIVE_URL, async ({ request }) => {
    patchCount += 1;
    patchBodyText = await request.text();

    return HttpResponse.json({ ...buildUser(), isActive: false });
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
      id: "admin-1",
      email: "root@example.com",
      userName: "root",
      name: "Root",
      lastName: "Admin",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
});

afterEach(() => {
  toast.dismiss();
  server.resetHandlers();
  patchCount = 0;
  patchBodyText = null;
});

afterAll(() => {
  server.close();
});

function Host({ initialUser }: { initialUser: UserDTO }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setUser(initialUser);
          setOpen(true);
        }}
      >
        toggle-trigger
      </button>
      <ActiveConfirmDialog
        user={user}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setUser(null);
          }
        }}
      />
    </>
  );
}

function renderHost(initialUser: UserDTO) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <Host initialUser={initialUser} />
        <Toaster />
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { client, invalidateSpy, container };
}

async function openDialog(initialUser: UserDTO) {
  const rendered = renderHost(initialUser);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "toggle-trigger" }));

  return { ...rendered, user };
}

describe("active confirm dialog — confirmation (S2, S4, S7)", () => {
  it("asks for explicit confirmation with title, body and both buttons before mutating", async () => {
    await openDialog(buildUser());

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("active.confirmTitle"));
    expect(dialog).toHaveTextContent("Ada Lovelace");
    expect(
      within(dialog).getByRole("button", { name: tUsers("active.deactivate") }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: tUsers("edit.cancel") })).toBeInTheDocument();
    expect(patchCount).toBe(0);
  });

  it("labels the confirm button deactivate for an active user (S5)", async () => {
    await openDialog(buildUser({ isActive: true }));

    const dialog = screen.getByRole("alertdialog");
    expect(
      within(dialog).getByRole("button", { name: tUsers("active.deactivate") }),
    ).toBeInTheDocument();
  });

  it("labels the confirm button activate for an inactive user (S5)", async () => {
    await openDialog(buildUser({ isActive: false }));

    const dialog = screen.getByRole("alertdialog");
    expect(
      within(dialog).getByRole("button", { name: tUsers("active.activate") }),
    ).toBeInTheDocument();
  });

  it("sends nothing while the dialog stays open", async () => {
    await openDialog(buildUser());

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(patchCount).toBe(0);
  });
});

describe("active confirm dialog — toggle PATCH (S11, S9)", () => {
  it("PATCHes the toggle endpoint without a body, toasts success and closes", async () => {
    const { client, user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("active.deactivate"),
      }),
    );

    await waitFor(() => {
      expect(patchCount).toBe(1);
    });
    expect(patchBodyText).toBe("");
    expect(await screen.findByText(tUsers("active.success"))).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    const cached = client.getQueryData<UserDTO>(userQueryKey("u1"));
    expect(cached?.isActive).toBe(false);
  });

  it("seeds the detail cache with the echoed user and invalidates the list (S9)", async () => {
    const { client, invalidateSpy, user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("active.deactivate"),
      }),
    );

    await waitFor(() => {
      expect(client.getQueryData(userQueryKey("u1"))).toMatchObject({ isActive: false });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
  });

  it("closes without mutating when the confirmation is cancelled", async () => {
    await openDialog(buildUser());
    const user = userEvent.setup();

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: tUsers("edit.cancel") }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(patchCount).toBe(0);
  });

  it("keeps the dialog open and toasts the generic error when the toggle fails", async () => {
    server.use(http.patch(USER_ACTIVE_URL, () => HttpResponse.json({}, { status: 500 })));
    const { user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("active.deactivate"),
      }),
    );

    expect(await screen.findByText(tCommon("error.genericMessage"))).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.queryByText(tUsers("active.success"))).not.toBeInTheDocument();
  });
});

describe("active confirm dialog — self protection (S3, S8)", () => {
  it("blocks self-deactivation with a clear message, no dialog and no request", async () => {
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

    await openDialog(buildUser({ id: "u1", isActive: true }));

    expect(await screen.findByText(tUsers("active.selfBlocked"))).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(patchCount).toBe(0);
  });

  it("still allows activating an inactive own account", async () => {
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

    await openDialog(buildUser({ id: "u1", isActive: false }));
    const user = userEvent.setup();

    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: tUsers("active.activate") }));

    expect(await screen.findByText(tUsers("active.success"))).toBeInTheDocument();
    expect(patchCount).toBe(1);
  });
});

describe("active confirm dialog — accessibility (S10)", () => {
  it("has no axe violations while open", async () => {
    const { container } = renderHost(buildUser());
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "toggle-trigger" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});
