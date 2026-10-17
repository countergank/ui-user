// Unit tests for the minimal HTTP client (COU-273, T1).
//
// The client owns four things and nothing else: base URL + JSON, the Bearer header,
// mapping the API's error envelope onto `AppError`, and one 401 retry delegated to a
// caller-supplied hook. Network details stay injectable so every branch is testable.
import { describe, expect, it, vi } from "vitest";

import { AppError } from "./errors";
import { createHttpClient } from "./http";

const BASE = "https://api.test";

/** A `fetch` double that answers with the given status/body and records its calls. */
function fetchStub(status: number, body: unknown) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  })) as unknown as typeof fetch & { mock: { calls: unknown[][] } };
}

describe("http client", () => {
  it("joins the base URL with the path and sends a JSON body", async () => {
    const fetchImpl = fetchStub(200, { ok: true });
    const client = createHttpClient({ baseUrl: BASE, fetchImpl });

    const result = await client.request("auth/refresh", {
      method: "POST",
      body: { refreshToken: "r1" },
    });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/auth/refresh`);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ refreshToken: "r1" }));
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
  });

  it("adds the Bearer header only when a token is available", async () => {
    const withToken = fetchStub(200, {});
    await createHttpClient({ baseUrl: BASE, fetchImpl: withToken, getAccessToken: () => "abc" })
      .request("auth/me");

    const [, init] = withToken.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer abc");

    const withoutToken = fetchStub(200, {});
    await createHttpClient({ baseUrl: BASE, fetchImpl: withoutToken, getAccessToken: () => null })
      .request("auth/me");

    const [, anonInit] = withoutToken.mock.calls[0] as [string, RequestInit];
    expect(new Headers(anonInit.headers).get("authorization")).toBeNull();
  });

  it("maps the API error envelope onto AppError with its code and status", async () => {
    const fetchImpl = fetchStub(401, {
      statusCode: 401,
      code: "UA-AUTH-009",
      message: "Invalid refresh token",
    });
    const client = createHttpClient({ baseUrl: BASE, fetchImpl });

    const error = await client.request("auth/refresh", { method: "POST" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("UA-AUTH-009");
    expect((error as AppError).status).toBe(401);
    expect((error as AppError).message).toBe("Invalid refresh token");
  });

  it("still produces an AppError when the error body is not JSON", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 502,
      headers: new Headers({ "content-type": "text/html" }),
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
      text: async () => "<html>bad gateway</html>",
    })) as unknown as typeof fetch;

    const error = await createHttpClient({ baseUrl: BASE, fetchImpl })
      .request("auth/me")
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).status).toBe(502);
    expect((error as AppError).code).toBe("HTTP_ERROR");
  });

  it("retries exactly once after the 401 hook renews the session", async () => {
    const responses = [
      { status: 401, body: { statusCode: 401, code: "UA-AUTH-009", message: "expired" } },
      { status: 200, body: { id: "u1" } },
    ];
    const fetchImpl = vi.fn(async () => {
      const next = responses.shift()!;
      return {
        ok: next.status === 200,
        status: next.status,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => next.body,
        text: async () => JSON.stringify(next.body),
      };
    }) as unknown as typeof fetch;
    const onUnauthorized = vi.fn(async () => true);

    const client = createHttpClient({ baseUrl: BASE, fetchImpl, onUnauthorized });
    const result = await client.request("auth/me");

    expect(result).toEqual({ id: "u1" });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry when the 401 hook reports the session is gone", async () => {
    const fetchImpl = fetchStub(401, { statusCode: 401, code: "UA-AUTH-009", message: "gone" });
    const onUnauthorized = vi.fn(async () => false);

    const error = await createHttpClient({ baseUrl: BASE, fetchImpl, onUnauthorized })
      .request("auth/me")
      .catch((e: unknown) => e);

    expect((error as AppError).code).toBe("UA-AUTH-009");
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("wraps a transport failure as a NETWORK_ERROR AppError", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    const error = await createHttpClient({ baseUrl: BASE, fetchImpl })
      .request("auth/me")
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("NETWORK_ERROR");
  });
});
