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

import { ResendVerificationConfirmDialog } from "./components/resend-verification-confirm-dialog";
import type { UserDTO } from "./types";

const USERS_URL = "https://test.invalid/admin/users";
const RESEND_VERIFICATION_URL = `${USERS_URL}/u1/resend-verification`;

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
    emailVerified: false,
    hasPendingEmailChange: false,
    hasPendingPasswordReset: false,
    ...overrides,
  };
}

let postCount = 0;
let postBodyText: string | null = null;

const server = setupServer(
  http.post(RESEND_VERIFICATION_URL, async ({ request }) => {
    postCount += 1;
    postBodyText = await request.text();

    return HttpResponse.json({ message: "ok-resent", userId: "u1" });
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
        resend-trigger
      </button>
      <ResendVerificationConfirmDialog
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
  await rendered.user.click(screen.getByRole("button", { name: "resend-trigger" }));

  return rendered;
}

describe("resend verification confirm dialog — confirmation (127 S2)", () => {
  it("asks for explicit confirmation with title, body and both buttons before mutating", async () => {
    await openDialog(buildUser());

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("resendVerification.confirmTitle"));
    expect(dialog).toHaveTextContent("Ada Lovelace");
    expect(
      within(dialog).getByRole("button", { name: tUsers("resendVerification.action") }),
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

describe("resend verification confirm dialog — resend POST (127 S2, S5)", () => {
  it("fires a single POST when the confirm button is clicked repeatedly", async () => {
    server.use(
      http.post(RESEND_VERIFICATION_URL, async () => {
        postCount += 1;
        await delay(300);

        return HttpResponse.json({ message: "ok-resent", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    const confirmButton = within(screen.getByRole("alertdialog")).getByRole("button", {
      name: tUsers("resendVerification.action"),
    });
    await user.click(confirmButton);
    if (!confirmButton.hasAttribute("disabled")) {
      await user.click(confirmButton);
    }

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText("ok-resent")).toBeInTheDocument();
  });

  it("POSTs the resend endpoint without a body, toasts the API message and closes", async () => {
    const { user } = await openDialog(buildUser());

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("resendVerification.action"),
      }),
    );

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(postBodyText).toBe("");
    expect(await screen.findByText("ok-resent")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("falls back to the translated success key when the API message is empty", async () => {
    server.use(
      http.post(RESEND_VERIFICATION_URL, () => {
        postCount += 1;

        return HttpResponse.json({ message: "", userId: "u1" });
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("resendVerification.action"),
      }),
    );

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("resendVerification.success"))).toBeInTheDocument();
  });

  it("keeps the dialog open and toasts the generic error when the resend fails with 4xx", async () => {
    server.use(
      http.post(RESEND_VERIFICATION_URL, () => {
        postCount += 1;

        return HttpResponse.json(
          { message: "email already verified", code: "EMAIL_ALREADY_VERIFIED" },
          { status: 409 },
        );
      }),
    );

    const { user } = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: tUsers("resendVerification.action"),
      }),
    );

    await waitFor(() => {
      expect(postCount).toBe(1);
    });
    expect(await screen.findByText("email already verified")).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("resend verification confirm dialog — accessibility", () => {
  it("has no axe violations while open", async () => {
    const { container } = await openDialog(buildUser());

    expect(await axe(container)).toHaveNoViolations();
  });
});
