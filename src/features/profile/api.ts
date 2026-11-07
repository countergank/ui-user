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
