import { useQuery } from "@tanstack/react-query";

import { fetchUser } from "../api";

export function userQueryKey(id: string) {
  return ["admin", "users", id] as const;
}

/**
 * @param id - the user id from the route, or `undefined` before the route resolves; the query
 * stays idle until there is an id to fetch.
 * @returns The prefill query for one user, validated against the `UserDTO` schema by the
 * fetcher.
 */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userQueryKey(id ?? ""),
    queryFn: () => fetchUser(id ?? ""),
    enabled: id !== undefined && id !== "",
  });
}
