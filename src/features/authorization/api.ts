import { z } from "zod";

import { DataFetchError } from "@/lib/errors";
import { httpClient } from "@/lib/session/session";

/**
 * `/auth/me` transport (COU-275, T2 / S8). The API answers with the user's *effective*
 * permissions (`api-user/src/auth/dto/me-response.dto.ts`). The response is validated
 * first: a payload that silently lost `permissions` would hide every section.
 */
export const meResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  lastName: z.string(),
  email: z.string().min(1),
  role: z.string().min(1),
  permissions: z.array(z.string()),
});

/** The authenticated user as the console sees them. */
export type MeResponse = z.infer<typeof meResponseSchema>;

export async function fetchMe(): Promise<MeResponse> {
  const payload = await httpClient.request<unknown>("/auth/me");
  const parsed = meResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new DataFetchError("The session profile response did not match the API contract.", {
      code: "ME_CONTRACT_INVALID",
      cause: parsed.error,
    });
  }

  return parsed.data;
}
