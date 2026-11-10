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

import { UnlockConfirmDialog } from "./components/unlock-confirm-dialog";
import type { UserDTO } from "./types";

const USERS_URL = "https://test.invalid/admin/users";
const UNLOCK_URL = `${USERS_URL}/u1/unlock`;

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
    lockedUntil: new Date(Date.now() + 10 * 60_000).toISOString(),
    failedLoginAttempts: 3,
    emailVerified: true,
    hasPendingEmailChange: false,
    hasPendingPasswordReset: false,
    ...overrides,
  };
}

let patchCount = 0;
let patchBodyText: string | null = null;

const server = setupServer(
  http.patch(UNLOCK_URL, async ({ request }) => {
    patchCount += 1;
    patchBodyText = await request.text();

    return HttpResponse.json({ message: "ok-unlocked", userId: "u1" });
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
        unlock-trigger
      </button>
      <UnlockConfirmDialog
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
  const user = userEvent.setup();

  return { user, invalidateSpy, container };
}

async function openDialog(initialUser: UserDTO) {
  const rendered = renderHost(initialUser);
  await rendered.user.click(screen.getByRole("button", { name: "unlock-trigger" }));

  return rendered;
}

describe("unlock confirm dialog — confirmation (S2, S7)", () => {
  it("asks for explicit confirmation with title, body and both buttons before mutating", async () => {
    await openDialog(buildUser());

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("unlock.confirmTitle"));
    expect(dialog).toHaveTextContent("Ada Lovelace");
    expect(
      within(dialog).getByRole("button", { name: tUsers("unlock.action") }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: tUsers("edit.cancel") })).toBeInTheDocument();
    expect(patchCount).toBe(0);
  });

  it("sends nothing while the dialog stays open", async () => {
    const { user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: tUsers("edit.cancel") }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(patchCount).toBe(0);
  });
});

describe("unlock confirm dialog — unlock PATCH (S1, S5)", () => {
  it("PATCHes the unlock endpoint without a body, toasts the API message and closes", async () => {
    const { user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("unlock.action"),
      }),
    );

    await waitFor(() => {
      expect(patchCount).toBe(1);
    });
    expect(patchBodyText).toBe("");
    expect(await screen.findByText("ok-unlocked")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("falls back to the translated success key when the API message is empty", async () => {
    server.use(
      http.patch(UNLOCK_URL, () => {
        patchCount += 1;

        return HttpResponse.json({ message: "", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("unlock.action"),
      }),
    );

    await waitFor(() => {
      expect(patchCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("unlock.success"))).toBeInTheDocument();
  });

  it("keeps the dialog open and toasts the generic error when the unlock fails", async () => {
    server.use(
      http.patch(UNLOCK_URL, () => {
        patchCount += 1;

        return HttpResponse.json(
          { message: "user is not locked", code: "USER_NOT_LOCKED" },
          { status: 409 },
        );
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("unlock.action"),
      }),
    );

    await waitFor(() => {
      expect(patchCount).toBe(1);
    });
    expect(await screen.findByText(tCommon("error.genericMessage"))).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("unlock confirm dialog — accessibility (S6)", () => {
  it("has no axe violations while open", async () => {
    const { container } = await openDialog(buildUser());

    expect(await axe(container)).toHaveNoViolations();
  });
});
