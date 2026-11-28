import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors";

import { httpClient } from "@/lib/session/session";

import {
  activateTwoFactor,
  changePassword,
  enrollTwoFactor,
  requestEmailChange,
  requestEmailChangeCode,
  uploadProfilePhoto,
} from "./api";

const PHOTO_URL = "/users/profile/photo";

const requestSpy = vi.spyOn(httpClient, "request");

beforeEach(() => {
  requestSpy.mockReset();
});

function photoFile(bytes: number, type = "image/png"): File {
  return new File([new Uint8Array(bytes)], "me.png", { type });
}

describe("requestEmailChangeCode", () => {
  it("posts on /users/change-email/code and resolves on 200", async () => {
    requestSpy.mockResolvedValue({ message: "code sent" });

    await requestEmailChangeCode();

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [string, { method?: string }];
    expect(path).toBe("/users/change-email/code");
    expect(options.method).toBe("POST");
  });
});

describe("requestEmailChange", () => {
  it("posts the new email and the identity code on /users/change-email and resolves on 200", async () => {
    requestSpy.mockResolvedValue({});

    await requestEmailChange("nueva@countergank.com", "123456");

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [
      string,
      { method?: string; body?: unknown },
    ];
    expect(path).toBe("/users/change-email");
    expect(options.method).toBe("POST");
    expect(options.body).toEqual({ email: "nueva@countergank.com", code: "123456" });
  });
});

describe("changePassword", () => {
  it("posts the current and new passwords on /users/change-password and resolves on 200", async () => {
    requestSpy.mockResolvedValue({});

    await changePassword("ViejaS3gura!", "NuevaS3gura!");

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [
      string,
      { method?: string; body?: unknown },
    ];
    expect(path).toBe("/users/change-password");
    expect(options.method).toBe("POST");
    expect(options.body).toEqual({ currentPassword: "ViejaS3gura!", newPassword: "NuevaS3gura!" });
  });
});

describe("enrollTwoFactor", () => {
  it("posts on /auth/2fa/enroll and returns the secret with the otpauth URL", async () => {
    requestSpy.mockResolvedValue({ secret: "JBSWY3DPEHPK3PXP", otpauthUrl: "otpauth://totp/u1" });

    const result = await enrollTwoFactor();

    expect(result).toEqual({ secret: "JBSWY3DPEHPK3PXP", otpauthUrl: "otpauth://totp/u1" });
    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [
      string,
      { method?: string; body?: unknown },
    ];
    expect(path).toBe("/auth/2fa/enroll");
    expect(options.method).toBe("POST");
    expect(options.body).toBeUndefined();
  });

  it("rejects a response that drifts from the enrollment contract", async () => {
    requestSpy.mockResolvedValue({ secret: "JBSWY3DPEHPK3PXP" });

    const error = await enrollTwoFactor().catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(ZodError);
  });
});

describe("activateTwoFactor", () => {
  it("posts the code on /auth/2fa/activate and returns the activation flag", async () => {
    requestSpy.mockResolvedValue({ twoFactorEnabled: true });

    const result = await activateTwoFactor("123456");

    expect(result).toEqual({ twoFactorEnabled: true });
    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [
      string,
      { method?: string; body?: unknown },
    ];
    expect(path).toBe("/auth/2fa/activate");
    expect(options.method).toBe("POST");
    expect(options.body).toEqual({ code: "123456" });
  });

  it("rejects an empty code before any network traffic", async () => {
    const error = await activateTwoFactor("").catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("UA-AUTH-013");
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("rejects a non-6-digit code before any network traffic", async () => {
    const error = await activateTwoFactor("12a456").catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("UA-AUTH-013");
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("rejects a response that drifts from the activation contract", async () => {
    requestSpy.mockResolvedValue({});

    const error = await activateTwoFactor("123456").catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(ZodError);
  });
});

describe("uploadProfilePhoto", () => {
  it("posts the file as multipart form data on /users/profile/photo and returns the served avatar URL", async () => {
    requestSpy.mockResolvedValue({ avatarUrl: "https://cdn.example/u1/avatar.png" });

    const result = await uploadProfilePhoto(photoFile(10));

    expect(result).toEqual({ avatarUrl: "https://cdn.example/u1/avatar.png" });
    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [path, options] = requestSpy.mock.calls[0] as [
      string,
      { method?: string; body?: unknown },
    ];
    expect(path).toBe(PHOTO_URL);
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("rejects an unsupported format with the catalog code before any network traffic", async () => {
    const file = new File([new Uint8Array(10)], "me.gif", { type: "image/gif" });

    const error = await uploadProfilePhoto(file).catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("UA-USR-005");
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 2 MB with the catalog code before any network traffic", async () => {
    const file = photoFile(2 * 1024 * 1024 + 1);

    const error = await uploadProfilePhoto(file).catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("UA-USR-006");
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("accepts a file of exactly 2 MB", async () => {
    requestSpy.mockResolvedValue({ avatarUrl: "https://cdn.example/u1/avatar.png" });

    const result = await uploadProfilePhoto(photoFile(2 * 1024 * 1024));

    expect(result).toEqual({ avatarUrl: "https://cdn.example/u1/avatar.png" });
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it("accepts every format the endpoint documents", async () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      requestSpy.mockResolvedValue({ avatarUrl: "https://cdn.example/u1/avatar.png" });

      await uploadProfilePhoto(photoFile(10, type));
    }

    expect(requestSpy).toHaveBeenCalledTimes(3);
  });
});
