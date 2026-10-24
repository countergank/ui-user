import { useListQuery } from "@/components/data-list/hooks/use-list-query";
import type { ListParams } from "@/components/data-list/params";

import { fetchUsers, usersQueryFromListParams } from "../api";
import type { PaginatedUsers } from "../types";

export const USERS_QUERY_KEY = ["admin", "users"] as const;

export function useUsers(params: ListParams) {
  return useListQuery<PaginatedUsers>({
    queryKey: USERS_QUERY_KEY,
    params,
    queryFn: (params) => fetchUsers(usersQueryFromListParams(params)),
  });
}
