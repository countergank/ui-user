import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ListParams } from "../params";

interface UseListQueryOptions<TData> {
  queryKey: readonly unknown[];
  params: ListParams;
  queryFn: (params: ListParams) => Promise<TData>;
}

/**
 * @returns The list query for the params; they join the cache key and previous data stays
 * visible while the next page loads.
 */
export function useListQuery<TData>({ queryKey, params, queryFn }: UseListQueryOptions<TData>) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    placeholderData: keepPreviousData,
  });
}
