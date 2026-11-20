import { z } from "zod";

import { httpClient } from "@/lib/session/session";

export const FALLBACK_ROLES = ["admin", "user", "viewer"] as const;

const roleSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const rolesPageSchema = z.object({
  data: z.array(roleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

/**
 * @returns The role names from `GET /roles`, validated against the paginated envelope. The
 * whole catalog is requested in one page (`limit=100`, the API maximum), so a role created
 * beyond a default page is not lost to the filter or the forms.
 */
export async function fetchRoles(): Promise<string[]> {
  const raw = await httpClient.request<unknown>("/roles?page=1&limit=100");

  return rolesPageSchema.parse(raw).data.map((role) => role.name);
}
