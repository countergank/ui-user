import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  type ListParams,
  type ListParamsConfig,
  clearListFilters,
  parseListParams,
  serializeListParams,
  withFilter,
  withLimit,
  withPage,
  withSort,
} from "../params";

export interface UseListParamsResult {
  params: ListParams;
  setFilter: (name: string, value: string | null) => void;
  setSort: (sortBy: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
}

/**
 * @returns URL-backed list params; filter and sort changes replace the history entry, a
 * page change pushes one.
 */
export function useListParams(config: ListParamsConfig): UseListParamsResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => parseListParams(searchParams, config), [searchParams, config]);

  const navigate = (params: ListParams, replace: boolean) => {
    setSearchParams(serializeListParams(params, config), { replace });
  };

  return {
    params,
    setFilter: (name, value) => {
      navigate(withFilter(params, name, value, config), true);
    },
    setSort: (sortBy) => {
      navigate(withSort(params, sortBy), true);
    },
    setPage: (page) => {
      navigate(withPage(params, page), false);
    },
    setLimit: (limit) => {
      navigate(withLimit(params, limit), true);
    },
    clearFilters: () => {
      navigate(clearListFilters(params), true);
    },
  };
}
