import { z } from "zod";

import { AppError } from "@/lib/errors";
import { httpClient } from "@/lib/session/session";

import { profileSchema } from "./types";
import type { ProfileDTO } from "./types";

export interface UpdateProfilePayload {
  name?: string;
  lastName?: string;
}

/**
 * @returns The validated profile of the signed-in user, so a contract drift on the
 * `{ name, lastName, email }` shape fails here and not in the form.
 */
export async function fetchProfile(): Promise<ProfileDTO> {
  const raw = await httpClient.request<unknown>("/users/profile");

  return profileSchema.parse(raw);
}

/**
 * @param payload - the `PATCH /users/profile` body; every field is optional and only the
 * changed ones travel. The email is read-only on this screen and never part of the payload.
 * @returns The validated `ProfileDTO` as the API echoes it after the patch.
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileDTO> {
  const raw = await httpClient.request<unknown>("/users/profile", {
    method: "PATCH",
    body: payload,
  });

  return profileSchema.parse(raw);
}

export const PROFILE_PHOTO_URL = "/users/profile/photo";

const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

const ACCEPTED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const profilePhotoUploadSchema = z.object({ avatarUrl: z.string().min(1) });

function assertUploadablePhoto(file: File): void {
  if (!ACCEPTED_PROFILE_PHOTO_TYPES.has(file.type)) {
    throw new AppError("The profile photo format is not supported.", { code: "UA-USR-005" });
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new AppError("The profile photo exceeds the 2 MB limit.", { code: "UA-USR-006" });
  }
}

/**
 * @param file - the image selected by the user; validated before any network traffic against
 * the endpoint contract (JPG, PNG or WebP, up to 2 MB).
 * @returns The served `avatarUrl` echoed by the API, parsed against the contract so a drift
 * fails here and not in the avatar.
 */
export async function uploadProfilePhoto(file: File): Promise<{ avatarUrl: string }> {
  assertUploadablePhoto(file);

  const form = new FormData();
  form.append("file", file);

  const raw = await httpClient.request<unknown>(PROFILE_PHOTO_URL, {
    method: "POST",
    body: form,
  });

  return profilePhotoUploadSchema.parse(raw);
}
