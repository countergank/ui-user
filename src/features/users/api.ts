import type { ListParams, SortOrder } from "@/components/data-list/params";

import { httpClient } from "@/lib/session/session";

import {
  type CreateUserResponseDTO,
  type PaginatedUsers,
  createUserResponseSchema,
  paginatedUsersSchema,
} from "./types";

export interface CreateUserPayload {
  name: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  role: string;
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
