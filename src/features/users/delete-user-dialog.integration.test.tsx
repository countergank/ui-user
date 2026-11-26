import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { DeleteUserDialog } from "./components/delete-user-dialog";
import type { UserDTO } from "./types";

const USERS_URL = "https://test.invalid/admin/users";
const DELETE_URL = `${USERS_URL}/u1`;

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
    emailVerified: true,
    hasPendingEmailChange: false,
    hasPendingPasswordReset: false,
    ...overrides,
  };
}

let deleteCount = 0;

const server = setupServer(
  http.delete(DELETE_URL, () => {
    deleteCount += 1;

    return HttpResponse.json({ message: "ok-deleted", userId: "u1" });
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
  deleteCount = 0;
});

afterAll(() => {
  server.close();
});

function Host({
  initialUser,
  onDeleted,
}: {
  initialUser: UserDTO;
  onDeleted?: (id: string) => void;
}) {
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
        delete-trigger
      </button>
      <DeleteUserDialog
        user={user}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setUser(null);
          }
        }}
        onDeleted={onDeleted}
      />
    </>
  );
}

function renderHost(initialUser: UserDTO, onDeleted?: (id: string) => void) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/app/users"]}>
          <Routes>
            <Route
              path="/app/users"
              element={<Host initialUser={initialUser} onDeleted={onDeleted} />}
            />
            <Route path="/login" element={<p>login-screen</p>} />
          </Routes>
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return userEvent.setup();
}

async function openDialog(initialUser: UserDTO, onDeleted?: (id: string) => void) {
  const user = renderHost(initialUser, onDeleted);
  await user.click(screen.getByRole("button", { name: "delete-trigger" }));

  return user;
}

describe("delete user dialog — strong confirmation (S1)", () => {
  it("renders the destructive title, body with the confirmation phrase and keeps confirm disabled", async () => {
    await openDialog(buildUser());

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(tUsers("delete.confirmTitle"));
    expect(dialog).toHaveTextContent("Ada Lovelace");
    expect(dialog).toHaveTextContent("ada@example.com");
    expect(dialog).toHaveTextContent("ada");
    const confirmButton = within(dialog).getByRole("button", { name: tUsers("delete.action") });
    expect(confirmButton).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: tUsers("edit.cancel") })).toBeInTheDocument();
    expect(deleteCount).toBe(0);
  });

  it("stays disabled while the typed text does not match", async () => {
    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");

    const input = within(dialog).getByRole("textbox");
    await user.type(input, "ada@example");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeDisabled();

    await user.clear(input);
    await user.type(input, "wrong-phrase");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeDisabled();
    expect(deleteCount).toBe(0);
  });

  it("enables confirm only when the text matches the email or the userName", async () => {
    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");
    const input = within(dialog).getByRole("textbox");

    await user.type(input, "ada@example.com");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeEnabled();

    await user.clear(input);
    await user.type(input, "ada");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeEnabled();
  });

  it("sends nothing when cancelled", async () => {
    const user = await openDialog(buildUser());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: tUsers("edit.cancel") }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(deleteCount).toBe(0);
  });

  it("trims and is case-insensitive on the typed confirmation", async () => {
    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");

    await user.type(within(dialog).getByRole("textbox"), "  ADA@example.com  ");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeEnabled();
  });
});

describe("delete user dialog — DELETE (S1, S5)", () => {
  it("DELETEs once on confirm, toasts the API message, closes and reports the deleted id", async () => {
    server.use(
      http.delete(DELETE_URL, async () => {
        deleteCount += 1;
        await delay(300);

        return HttpResponse.json({ message: "ok-deleted", userId: "u1" });
      }),
    );

    const onDeleted = vi.fn();
    const user = await openDialog(buildUser(), onDeleted);
    const dialog = screen.getByRole("alertdialog");
    await user.type(within(dialog).getByRole("textbox"), "ada@example.com");
    const confirmButton = within(dialog).getByRole("button", { name: tUsers("delete.action") });
    await user.click(confirmButton);
    if (!confirmButton.hasAttribute("disabled")) {
      await user.click(confirmButton);
    }

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText("ok-deleted")).toBeInTheDocument();
    expect(onDeleted).toHaveBeenCalledWith("u1");
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("falls back to the translated success key when the API message is empty", async () => {
    server.use(
      http.delete(DELETE_URL, () => {
        deleteCount += 1;

        return HttpResponse.json({ message: "", userId: "u1" });
      }),
    );

    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");
    await user.type(within(dialog).getByRole("textbox"), "ada");
    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.action") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("delete.success"))).toBeInTheDocument();
  });

  it("keeps the dialog open and shows the 404 copy when the user is gone", async () => {
    server.use(
      http.delete(DELETE_URL, () => {
        deleteCount += 1;

        return HttpResponse.json(
          { message: "user not found", code: "USER_NOT_FOUND" },
          { status: 404 },
        );
      }),
    );

    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");
    await user.type(within(dialog).getByRole("textbox"), "ada@example.com");
    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.action") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("delete.errors.notFound"))).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("keeps the dialog open and shows the 403 copy when the permission is missing", async () => {
    server.use(
      http.delete(DELETE_URL, () => {
        deleteCount += 1;

        return HttpResponse.json({ message: "forbidden", code: "FORBIDDEN" }, { status: 403 });
      }),
    );

    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");
    await user.type(within(dialog).getByRole("textbox"), "ada@example.com");
    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.action") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText(tUsers("delete.errors.forbidden"))).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("shows the generic error toast when the failure is not 403 or 404", async () => {
    server.use(
      http.delete(DELETE_URL, () => {
        deleteCount += 1;

        return HttpResponse.json({ message: "boom", code: "INTERNAL_ERROR" }, { status: 500 });
      }),
    );

    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");
    await user.type(within(dialog).getByRole("textbox"), "ada@example.com");
    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.action") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText(tCommon("error.genericMessage"))).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("delete user dialog — session self-delete (S3)", () => {
  it("ends the session locally and redirects to /login when the deleted user is the session's own", async () => {
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
    const onDeleted = vi.fn();
    const user = await openDialog(buildUser(), onDeleted);
    const dialog = screen.getByRole("alertdialog");

    await user.type(within(dialog).getByRole("textbox"), "ada@example.com");
    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.action") }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });
    expect(await screen.findByText("login-screen")).toBeInTheDocument();
    expect(sessionStore.getState().user).toBeNull();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});

describe("delete user dialog — inline fill (S8)", () => {
  it("fills the confirmation with the email when the email text is clicked", async () => {
    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");

    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.useEmail") }));

    expect(within(dialog).getByRole("textbox")).toHaveValue("ada@example.com");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeEnabled();
  });

  it("fills the confirmation with the userName when the userName text is clicked", async () => {
    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");

    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.useUserName") }));

    expect(within(dialog).getByRole("textbox")).toHaveValue("ada");
    expect(within(dialog).getByRole("button", { name: tUsers("delete.action") })).toBeEnabled();
  });

  it("replaces whatever was typed before with the clicked value", async () => {
    const user = await openDialog(buildUser());
    const dialog = screen.getByRole("alertdialog");
    await user.type(within(dialog).getByRole("textbox"), "wrong-text");

    await user.click(within(dialog).getByRole("button", { name: tUsers("delete.useEmail") }));

    expect(within(dialog).getByRole("textbox")).toHaveValue("ada@example.com");
  });

  it("shows the hint that the values are clickable", async () => {
    await openDialog(buildUser());

    expect(screen.getByText(tUsers("delete.clickHint"))).toBeInTheDocument();
  });
});

describe("delete user dialog — accessibility (S5)", () => {
  it("has no axe violations while open", async () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={["/app/users"]}>
            <Routes>
              <Route path="/app/users" element={<Host initialUser={buildUser()} />} />
              <Route path="/login" element={<p>login-screen</p>} />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </QueryClientProvider>,
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "delete-trigger" }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
