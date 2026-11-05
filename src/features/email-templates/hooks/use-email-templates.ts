import { useListQuery } from "@/components/data-list/hooks/use-list-query";
import type { ListParams } from "@/components/data-list/params";

import { emailTemplatesQueryFromFilters, fetchEmailTemplates } from "../api";
import type { PaginatedEmailTemplates } from "../api";

export const EMAIL_TEMPLATES_QUERY_KEY = ["email", "templates"] as const;

/**
 * @returns The template list query; the tri-state `active` filter maps onto the api-user query
 * and previous data stays visible while the next page loads.
 */
export function useEmailTemplates(params: ListParams) {
  return useListQuery<PaginatedEmailTemplates>({
    queryKey: EMAIL_TEMPLATES_QUERY_KEY,
    params,
    queryFn: (listParams) =>
      fetchEmailTemplates(
        emailTemplatesQueryFromFilters(
          listParams.page,
          listParams.limit,
          listParams.filters.active,
        ),
      ),
  });
}
