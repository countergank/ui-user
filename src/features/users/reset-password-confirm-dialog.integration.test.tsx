import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { ResetPasswordConfirmDialog } from "./components/reset-password-confirm-dialog";
import type { UserDTO } from "./types";

const USERS_URL = "https://test.invalid/admin/users";
const RESET_PASSWORD_URL = `${USERS_URL}/u1/reset-password`;

const tUsers = i18n.getFixedT(null, "users");

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
    emailVerified: true,
    hasPendingEmailChange: false,
    hasPendingPasswordReset: false,
    ...overrides,
  };
}

let postCount = 0;
let postBodyText: string | null = null;

const server = setupServer(
  http.post(RESET_PASSWORD_URL, async ({ request }) => {
    postCount += 1;
    postBodyText = await request.text();

    return HttpResponse.json({ message: "ok-reset", userId: "u1" });
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
  postCount = 0;
  postBodyText = null;
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
        reset-trigger
      </button>
      <ResetPasswordConfirmDialog
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
  await rendered.user.click(screen.getByRole("button", { name: "reset-trigger" }));

  return rendered;
}

describe("reset password confirm dialog — confirmation (127 S1)", () => {
  it("asks for explicit confirmation with title, body and both buttons before mutating", async () => {
    await openDialog(buildUser());

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("resetPassword.confirmTitle"));
    expect(dialog).toHaveTextContent("Ada Lovelace");
    expect(
      within(dialog).getByRole("button", { name: tUsers("resetPassword.action") }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: tUsers("edit.cancel") })).toBeInTheDocument();
    expect(postCount).toBe(0);
  });

  it("sends nothing while the dialog stays open", async () => {
    const { user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: tUsers("edit.cancel") }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(postCount).toBe(0);
  });
});

describe("reset password confirm dialog — reset POST (127 S1, S5)", () => {
  it("fires a single POST when the confirm button is clicked repeatedly", async () => {
    server.use(
      http.post(RESET_PASSWORD_URL, async () => {
        postCount += 1;
        await delay(300);

        return HttpResponse.json({ message: "ok-reset", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    const confirmButton = within(screen.getByRole("alertdialog")).getByRole("button", {
      name: tUsers("resetPassword.action"),
    });
    await user.click(confirmButton);
    if (!confirmButton.hasAttribute("disabled")) {
      await user.click(confirmButton);
    }

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText("ok-reset")).toBeInTheDocument();
  });

  it("POSTs the reset endpoint without a body, toasts the API message and closes", async () => {
    const { user, invalidateSpy } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("resetPassword.action"),
      }),
    );

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(postBodyText).toBe("");
    expect(await screen.findByText("ok-reset")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("falls back to the translated success key when the API message is empty", async () => {
    server.use(
      http.post(RESET_PASSWORD_URL, () => {
        postCount += 1;

        return HttpResponse.json({ message: "", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("resetPassword.action"),
      }),
    );

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("resetPassword.success"))).toBeInTheDocument();
  });

  it("keeps the dialog open and toasts the generic error when the reset fails with 4xx", async () => {
    server.use(
      http.post(RESET_PASSWORD_URL, () => {
        postCount += 1;

        return HttpResponse.json(
          { message: "insufficient permissions", code: "FORBIDDEN" },
          { status: 403 },
        );
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("resetPassword.action"),
      }),
    );

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText("insufficient permissions")).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("reset password confirm dialog — accessibility", () => {
  it("has no axe violations while open", async () => {
    const { container } = await openDialog(buildUser());

    expect(await axe(container)).toHaveNoViolations();
  });
});
