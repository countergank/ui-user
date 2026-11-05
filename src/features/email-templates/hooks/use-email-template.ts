import { useQuery } from "@tanstack/react-query";

import { fetchEmailTemplate } from "../api";

export function emailTemplateQueryKey(slug: string) {
  return ["email", "templates", slug] as const;
}

/**
 * @param slug - the template slug, or `""` before the editor resolves one; the query stays idle
 * until there is a slug to fetch.
 * @returns The prefill query for one template, validated against the `EmailTemplateDTO` schema
 * by the fetcher.
 */
export function useEmailTemplate(slug: string | undefined) {
  return useQuery({
    queryKey: emailTemplateQueryKey(slug ?? ""),
    queryFn: () => fetchEmailTemplate(slug ?? ""),
    enabled: slug !== undefined && slug !== "",
  });
}
