import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { useUnlockUser } from "./hooks/use-unlock-user";
import { userQueryKey } from "./hooks/use-user";
import { USERS_QUERY_KEY } from "./hooks/use-users";

const USERS_URL = "https://test.invalid/admin/users";
const UNLOCK_URL = `${USERS_URL}/u1/unlock`;

let patchCount = 0;
let patchIds: string[] = [];
let patchBodyText: string | null = null;

const server = setupServer(
  http.patch(`${USERS_URL}/:id/unlock`, async ({ params, request }) => {
    patchCount += 1;
    patchIds.push(String(params.id));
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
  server.resetHandlers();
  patchCount = 0;
  patchIds = [];
  patchBodyText = null;
});

afterAll(() => {
  server.close();
});

function Host({ id, onResult }: { id: string; onResult: (result: unknown) => void }) {
  const unlock = useUnlockUser();

  return (
    <button
      type="button"
      onClick={() => {
        unlock.mutate({ id }, { onSuccess: onResult, onError: onResult });
      }}
    >
      unlock
    </button>
  );
}

function createHarness(onResult: (result: unknown) => void = () => undefined) {
  const queryClient = new QueryClient();
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <Host id="u1" onResult={onResult} />
    </QueryClientProvider>,
  );

  return { user: userEvent.setup(), invalidateSpy, ...utils };
}

function createBareHarness(id: string, onResult: (result: unknown) => void) {
  const utils = render(
    <QueryClientProvider client={new QueryClient()}>
      <Host id={id} onResult={onResult} />
    </QueryClientProvider>,
  );

  return { user: userEvent.setup(), ...utils };
}

describe("useUnlockUser", () => {
  it("patches /admin/users/:id/unlock without a body", async () => {
    const { user } = createHarness();
    await user.click(screen.getByRole("button", { name: "unlock" }));

    await waitFor(() => {
      expect(patchCount).toBe(1);
    });

    expect(patchIds).toEqual(["u1"]);
    expect(patchBodyText).toBe("");
  });

  it("encodes a hostile id so it cannot change the path", async () => {
    const onResult = vi.fn();
    const { user } = createBareHarness("../u2", onResult);
    await user.click(screen.getByRole("button", { name: "unlock" }));

    await waitFor(() => {
      expect(patchCount).toBe(1);
    });

    expect(patchIds).toEqual(["../u2"]);
  });

  it("invalidates the users list and the detail cache on success", async () => {
    const { user, invalidateSpy } = createHarness();
    await user.click(screen.getByRole("button", { name: "unlock" }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userQueryKey("u1") });
  });

  it("surfaces the API error on failure", async () => {
    server.use(
      http.patch(UNLOCK_URL, () => {
        return HttpResponse.json(
          { message: "user is not locked", code: "USER_NOT_LOCKED" },
          { status: 409 },
        );
      }),
    );

    const onResult = vi.fn();
    const { user } = createBareHarness("u1", onResult);
    await user.click(screen.getByRole("button", { name: "unlock" }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledTimes(1);
    });

    const error = onResult.mock.calls[0]?.[0] as Error;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("user is not locked");
  });

  it("rejects a contract drift when the response misses the message", async () => {
    server.use(
      http.patch(UNLOCK_URL, async ({ request }) => {
        patchCount += 1;
        patchBodyText = await request.text();

        return HttpResponse.json({ userId: "u1" });
      }),
    );

    const onResult = vi.fn();
    const { user } = createBareHarness("u1", onResult);
    await user.click(screen.getByRole("button", { name: "unlock" }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledTimes(1);
    });

    expect(onResult.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(patchCount).toBe(1);
  });
});
