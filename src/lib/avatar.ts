import { env } from "@/lib/env";

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function apiOriginOf(apiBaseUrl: string): string {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return apiBaseUrl;
  }
}

/**
 * @param avatarUrl - the `avatarUrl` as the API serves it: an absolute public URL, a data URL,
 * or a path on the API origin (the local storage driver serves `/uploads/avatars/...`).
 * @param apiBaseUrl - the API base used to anchor relative paths; the origin carries the
 * served uploads because `@fastify/static` mounts them at the server root.
 * @returns The URL an `<img>` can load no matter where the app origin sits, or `undefined`
 * when the user has no photo.
 */
export function avatarSrcOf(
  avatarUrl: string | null | undefined,
  apiBaseUrl: string = env.apiBaseUrl,
): string | undefined {
  if (avatarUrl === undefined || avatarUrl === null || avatarUrl === "") {
    return undefined;
  }

  if (ABSOLUTE_URL_PATTERN.test(avatarUrl)) {
    return avatarUrl;
  }

  return `${apiOriginOf(apiBaseUrl).replace(/\/+$/, "")}/${avatarUrl.replace(/^\/+|\/+$/g, "")}`;
}
