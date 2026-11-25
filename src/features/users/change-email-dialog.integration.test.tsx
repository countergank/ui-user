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

import { ChangeEmailDialog } from "./components/change-email-dialog";
import type { UserDTO } from "./types";

const USERS_URL = "https://test.invalid/admin/users";
const CHANGE_EMAIL_URL = `${USERS_URL}/u1/change-email`;

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
let deleteCount = 0;
let postBody: { email?: string } | null = null;

const server = setupServer(
  http.post(CHANGE_EMAIL_URL, async ({ request }) => {
    postCount += 1;
    postBody = (await request.json()) as { email?: string };

    return HttpResponse.json({ message: "ok-change-email", userId: "u1" });
  }),
  http.delete(CHANGE_EMAIL_URL, () => {
    deleteCount += 1;

    return HttpResponse.json({ message: "ok-cancel-email", userId: "u1" });
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
  deleteCount = 0;
  postBody = null;
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
        change-email-trigger
      </button>
      <ChangeEmailDialog
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
  await rendered.user.click(screen.getByRole("button", { name: "change-email-trigger" }));

  return rendered;
}

describe("change email dialog — request (127 S3)", () => {
  it("asks for the new email with title, labeled input and both buttons before mutating", async () => {
    await openDialog(buildUser());

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("changeEmail.confirmTitle"));
    expect(
      within(dialog).getByRole("button", { name: tUsers("changeEmail.action") }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: tUsers("edit.cancel") })).toBeInTheDocument();
    expect(within(dialog).getByLabelText(tUsers("changeEmail.label"))).toBeInTheDocument();
    expect(postCount).toBe(0);
  });

  it("rejects an invalid email with an inline error and sends nothing", async () => {
    const { user } = await openDialog(buildUser());

    await user.type(screen.getByLabelText(tUsers("changeEmail.label")), "not-an-email");
    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.action") }));

    expect(await screen.findByText(tUsers("changeEmail.emailInvalid"))).toBeInTheDocument();
    expect(postCount).toBe(0);
  });

  it("rejects an empty email and sends nothing", async () => {
    const { user } = await openDialog(buildUser());

    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.action") }));

    expect(await screen.findByText(tUsers("changeEmail.fieldRequired"))).toBeInTheDocument();
    expect(postCount).toBe(0);
  });

  it("POSTs the new email, toasts the API message and closes", async () => {
    const { user } = await openDialog(buildUser());

    await user.type(screen.getByLabelText(tUsers("changeEmail.label")), "newada@example.com");
    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.action") }));

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(postBody).toEqual({ email: "newada@example.com" });
    expect(await screen.findByText("ok-change-email")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("fires a single POST when the confirm button is clicked repeatedly", async () => {
    server.use(
      http.post(CHANGE_EMAIL_URL, async () => {
        postCount += 1;
        await delay(300);

        return HttpResponse.json({ message: "ok-change-email", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.type(screen.getByLabelText(tUsers("changeEmail.label")), "newada@example.com");
    const confirmButton = screen.getByRole("button", { name: tUsers("changeEmail.action") });
    await user.click(confirmButton);
    if (!confirmButton.hasAttribute("disabled")) {
      await user.click(confirmButton);
    }

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText("ok-change-email")).toBeInTheDocument();
  });

  it("falls back to the translated success key when the API message is empty", async () => {
    server.use(
      http.post(CHANGE_EMAIL_URL, () => {
        postCount += 1;

        return HttpResponse.json({ message: "", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.type(screen.getByLabelText(tUsers("changeEmail.label")), "newada@example.com");
    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.action") }));

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("changeEmail.success"))).toBeInTheDocument();
  });

  it("keeps the dialog open and toasts the generic error when the request fails with 4xx", async () => {
    server.use(
      http.post(CHANGE_EMAIL_URL, () => {
        postCount += 1;

        return HttpResponse.json(
          { message: "email already in use", code: "EMAIL_TAKEN" },
          { status: 409 },
        );
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.type(screen.getByLabelText(tUsers("changeEmail.label")), "newada@example.com");
    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.action") }));

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText("email already in use")).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("change email dialog — pending request (127 S3)", () => {
  it("shows the pending notice and cancel action for a user with a pending change", async () => {
    await openDialog(buildUser({ hasPendingEmailChange: true }));

    expect(screen.getByText(tUsers("changeEmail.pendingTitle"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: tUsers("changeEmail.cancelPending") }),
    ).toBeInTheDocument();
  });

  it("offers no pending notice for a user without a pending change", async () => {
    await openDialog(buildUser({ hasPendingEmailChange: false }));

    expect(screen.queryByText(tUsers("changeEmail.pendingTitle"))).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: tUsers("changeEmail.cancelPending") }),
    ).not.toBeInTheDocument();
  });

  it("DELETEs the pending change, toasts the API message and closes", async () => {
    const { user } = await openDialog(buildUser({ hasPendingEmailChange: true }));

    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.cancelPending") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(postCount).toBe(0);
    expect(await screen.findByText("ok-cancel-email")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("keeps the dialog open and toasts the generic error when the cancel fails with 4xx", async () => {
    server.use(
      http.delete(CHANGE_EMAIL_URL, () => {
        deleteCount += 1;

        return HttpResponse.json(
          { message: "no pending change", code: "NO_PENDING_CHANGE" },
          { status: 409 },
        );
      }),
    );

    const { user } = await openDialog(buildUser({ hasPendingEmailChange: true }));
    await user.click(screen.getByRole("button", { name: tUsers("changeEmail.cancelPending") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText("no pending change")).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("change email dialog — accessibility", () => {
  it("has no axe violations while open", async () => {
    const { container } = await openDialog(buildUser({ hasPendingEmailChange: true }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
