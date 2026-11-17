import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/lib/session/session";

import { confirmEmailChange } from "./api";

const requestSpy = vi.spyOn(httpClient, "request");

beforeEach(() => {
  requestSpy.mockReset();
});

describe("confirmEmailChange", () => {
  it("posts the URL token on /auth/confirm-email-change and resolves on 200", async () => {
    requestSpy.mockResolvedValue({});

    await confirmEmailChange("58fcd204-0a43-47db-995e-84e44b7000c0");

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [
      string,
      { method?: string; body?: unknown },
    ];
    expect(path).toBe("/auth/confirm-email-change");
    expect(options.method).toBe("POST");
    expect(options.body).toEqual({ token: "58fcd204-0a43-47db-995e-84e44b7000c0" });
  });
});
