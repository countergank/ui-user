import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

import { httpClient } from "@/lib/session/session";

import { uploadProfilePhoto } from "./api";

const PHOTO_URL = "/users/profile/photo";

const requestSpy = vi.spyOn(httpClient, "request");

beforeEach(() => {
  requestSpy.mockReset();
});

function photoFile(bytes: number, type = "image/png"): File {
  return new File([new Uint8Array(bytes)], "me.png", { type });
}

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
