import { z } from "zod";

import type { ListParams, SortOrder } from "@/components/data-list/params";
import { type ActiveSessionDTO, activeSessionSchema } from "@/features/sessions/types";

import { httpClient } from "@/lib/session/session";

import {
  type CreateUserResponseDTO,
  type PaginatedUsers,
  type UnlockUserResponseDTO,
  type UserDTO,
  createUserResponseSchema,
  paginatedUsersSchema,
  unlockUserResponseSchema,
  userSchema,
} from "./types";
import type { UserRoleName } from "./types";

export interface CreateUserPayload {
  name: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  role: UserRoleName;
}

export interface UpdateUserPayload {
  name?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  role?: UserRoleName;
}

export interface UsersQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
  search?: string;
  role?: string;
  isActive?: boolean;
}

/**
 * @returns The api-user query; the tri-state `isActive` filter becomes a boolean and absent
 * filters become absent query params.
 */
export function usersQueryFromListParams(params: ListParams): UsersQuery {
  return {
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    search: params.filters.search,
    role: params.filters.role,
    isActive:
      params.filters.isActive === undefined ? undefined : params.filters.isActive === "true",
  };
}

/**
 * @param query - `page` is always sent: without it `api-user` answers a flat array instead of
 * the paginated envelope, so the client never omits it.
 * @returns The validated paginated envelope, so a contract drift fails here and not in the table.
 */
export async function fetchUsers(query: UsersQuery): Promise<PaginatedUsers> {
  const search = new URLSearchParams();

  search.set("page", String(query.page));
  search.set("limit", String(query.limit));
  search.set("sortBy", query.sortBy);
  search.set("sortOrder", query.sortOrder);
  if (query.search !== undefined) {
    search.set("search", query.search);
  }
  if (query.role !== undefined) {
    search.set("role", query.role);
  }
  if (query.isActive !== undefined) {
    search.set("isActive", String(query.isActive));
  }

  const raw = await httpClient.request<unknown>(`/admin/users?${search.toString()}`);

  return paginatedUsersSchema.parse(raw);
}

/**
 * @param payload - the create-user body; `role` always travels because the form defaults it to
 * `user`, matching the API default.
 * @returns The validated `CreateUserResponseDTO`. The API answers without an `id`, so a drift
 * on that shape fails here and not in the caller.
 */
export async function createUser(payload: CreateUserPayload): Promise<CreateUserResponseDTO> {
  const raw = await httpClient.request<unknown>("/admin/users", {
    method: "POST",
    body: payload,
  });

  return createUserResponseSchema.parse(raw);
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path.
 * @returns The validated `UserDTO`, so a contract drift on the detail shape fails here.
 */
export async function fetchUser(id: string): Promise<UserDTO> {
  const raw = await httpClient.request<unknown>(`/admin/users/${encodeURIComponent(id)}`);

  return userSchema.parse(raw);
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path.
 * @param payload - the `UpdateUserDTO`: every field is optional and only the changed ones travel.
 * There is no `password` here; password changes are a separate action.
 * @returns The validated `UserDTO` as the API echoes it after the patch.
 */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserDTO> {
  const raw = await httpClient.request<unknown>(`/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });

  return userSchema.parse(raw);
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path. The
 * endpoint clears the lock server-side, so the client sends no body.
 * @returns The validated `UnlockUserResponseDTO`; `message` is the API's already translated
 * confirmation text, ready to show in the toast as-is.
 */
export async function unlockUser(id: string): Promise<UnlockUserResponseDTO> {
  const raw = await httpClient.request<unknown>(`/admin/users/${encodeURIComponent(id)}/unlock`, {
    method: "PATCH",
  });

  return unlockUserResponseSchema.parse(raw);
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path.
 * @returns The user's active sessions, each validated against the `ActiveSessionDTO`
 * contract so a drift fails at the fetcher and not in the table.
 */
export async function fetchUserSessions(id: string): Promise<ActiveSessionDTO[]> {
  const raw = await httpClient.request<unknown>(`/admin/users/${encodeURIComponent(id)}/sessions`);

  return z.array(activeSessionSchema).parse(raw);
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path.
 * @param sessionId - the session to revoke, as listed by `fetchUserSessions`. The endpoint
 * answers `{message}` with 200 — not 204 — so there is no body to validate.
 */
export async function revokeUserSession(id: string, sessionId: string): Promise<void> {
  await httpClient.request<unknown>(
    `/admin/users/${encodeURIComponent(id)}/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path. The
 * endpoint invalidates every refresh token of that user server-side, so the client sends no
 * body; it answers `{message}` with 200 — not 204 — so there is no body to validate.
 */
export async function logoutAllUserSessions(id: string): Promise<void> {
  await httpClient.request<unknown>(`/admin/users/${encodeURIComponent(id)}/logout-all`, {
    method: "POST",
  });
}

/**
 * @param id - the user id; it is percent-encoded so a hostile id cannot change the path. The
 * endpoint toggles the active flag server-side, so the client sends no body.
 * @returns The validated `UserDTO` echoing the new `isActive`.
 */
export async function toggleUserActive(id: string): Promise<UserDTO> {
  const raw = await httpClient.request<unknown>(`/admin/users/${encodeURIComponent(id)}/active`, {
    method: "PATCH",
  });

  return userSchema.parse(raw);
}
