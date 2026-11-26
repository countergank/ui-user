import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { useDeleteUser } from "./hooks/use-delete-user";
import { userQueryKey } from "./hooks/use-user";
import { USERS_QUERY_KEY } from "./hooks/use-users";

const USERS_URL = "https://test.invalid/admin/users";
const DELETE_URL = `${USERS_URL}/u1`;

let deleteCount = 0;
let deletedIds: string[] = [];
let deleteBodyText: string | null = null;

const server = setupServer(
  http.delete(`${USERS_URL}/:id`, async ({ params, request }) => {
    deleteCount += 1;
    deletedIds.push(String(params.id));
    deleteBodyText = await request.text();

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
  server.resetHandlers();
  deleteCount = 0;
  deletedIds = [];
  deleteBodyText = null;
});

afterAll(() => {
  server.close();
});

function Host({ id, onResult }: { id: string; onResult: (result: unknown) => void }) {
  const remove = useDeleteUser();

  return (
    <button
      type="button"
      onClick={() => {
        remove.mutate({ id }, { onSuccess: onResult, onError: onResult });
      }}
    >
      delete
    </button>
  );
}

function createHarness(onResult: (result: unknown) => void = () => undefined) {
  const queryClient = new QueryClient();
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const removeSpy = vi.spyOn(queryClient, "removeQueries");
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <Host id="u1" onResult={onResult} />
    </QueryClientProvider>,
  );

  return { user: userEvent.setup(), invalidateSpy, removeSpy, ...utils };
}

function createBareHarness(id: string, onResult: (result: unknown) => void) {
  const utils = render(
    <QueryClientProvider client={new QueryClient()}>
      <Host id={id} onResult={onResult} />
    </QueryClientProvider>,
  );

  return { user: userEvent.setup(), ...utils };
}

describe("useDeleteUser", () => {
  it("DELETEs /admin/users/:id without a body", async () => {
    const { user } = createHarness();
    await user.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });

    expect(deletedIds).toEqual(["u1"]);
    expect(deleteBodyText).toBe("");
  });

  it("encodes a hostile id so it cannot change the path", async () => {
    const onResult = vi.fn();
    const { user } = createBareHarness("../u2", onResult);
    await user.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(deleteCount).toBe(1);
    });

    expect(deletedIds).toEqual(["../u2"]);
  });

  it("invalidates the users list and removes the detail cache on success", async () => {
    const { user, invalidateSpy, removeSpy } = createHarness();
    await user.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
    });
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: userQueryKey("u1") });
  });

  it("surfaces the API error on failure", async () => {
    server.use(
      http.delete(DELETE_URL, () => {
        return HttpResponse.json(
          { message: "user not found", code: "USER_NOT_FOUND" },
          { status: 404 },
        );
      }),
    );

    const onResult = vi.fn();
    const { user } = createBareHarness("u1", onResult);
    await user.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledTimes(1);
    });

    const error = onResult.mock.calls[0]?.[0] as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("user not found");
  });

  it("rejects a contract drift when the response misses the message", async () => {
    server.use(
      http.delete(DELETE_URL, () => {
        return HttpResponse.json({ userId: "u1" });
      }),
    );

    const onResult = vi.fn();
    const { user } = createBareHarness("u1", onResult);
    await user.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledTimes(1);
    });

    expect(onResult.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });
});
