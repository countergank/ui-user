import { z } from "zod";

import { httpClient } from "@/lib/session/session";

const permissionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const permissionsPageSchema = z.object({
  data: z.array(permissionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

/**
 * @returns A name-to-description map from `GET /permissions`, validated against the paginated
 * envelope. The whole catalog is requested in one page (`limit=100`, the API maximum), so no
 * permission label is lost to pagination.
 */
export async function fetchPermissionLabels(): Promise<Record<string, string>> {
  const raw = await httpClient.request<unknown>("/permissions?page=1&limit=100");

  return Object.fromEntries(
    permissionsPageSchema
      .parse(raw)
      .data.map((permission) => [permission.name, permission.description]),
  );
}
