import type { ListParams, SortOrder } from "@/components/data-list/params";

import { httpClient } from "@/lib/session/session";

import { type PaginatedUsers, paginatedUsersSchema } from "./types";

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
