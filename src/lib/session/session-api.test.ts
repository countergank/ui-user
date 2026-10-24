import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import type { HttpClient } from "@/lib/http";

import { createSessionApi } from "./session-api";

const AUTH = {
  user: {
    id: "u1",
    email: "user@example.com",
    userName: "user",
    name: "Ada",
    lastName: "Lovelace",
  },
  accessToken: "access-2",
  refreshToken: "refresh-2",
};

function clientReturning(value: unknown) {
  const request = vi.fn(() => Promise.resolve(value));

  return { request } as unknown as Pick<HttpClient, "request"> & {
    request: typeof request;
  };
}

describe("session api", () => {
  it("refreshes with the current refresh token and returns the rotated pair", async () => {
    const client = clientReturning(AUTH);

    await expect(createSessionApi(client).refresh("refresh-1")).resolves.toEqual(AUTH);

    expect(client.request).toHaveBeenCalledWith("/auth/refresh", {
      method: "POST",
      body: { refreshToken: "refresh-1" },
    });
  });

  it("revokes the refresh token on logout and resolves to nothing", async () => {
    const client = clientReturning({ message: "revoked" });

    await expect(createSessionApi(client).logout("refresh-1")).resolves.toBeUndefined();

    expect(client.request).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      body: { refreshToken: "refresh-1" },
    });
  });

  it("propagates the API error code instead of flattening it", async () => {
    const client = {
      request: vi.fn(() =>
        Promise.reject(new AppError("Invalid refresh token", { code: "UA-AUTH-009", status: 401 })),
      ),
    } as unknown as Pick<HttpClient, "request">;

    await expect(createSessionApi(client).refresh("dead-token")).rejects.toMatchObject({
      code: "UA-AUTH-009",
      status: 401,
    });
  });
});
