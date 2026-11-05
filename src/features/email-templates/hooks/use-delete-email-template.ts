import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteEmailTemplate } from "../api";
import { EMAIL_TEMPLATES_QUERY_KEY } from "./use-email-templates";

/**
 * @returns The delete-template mutation; the endpoint answers 204 with no body, and success
 * invalidates the templates list so the row disappears.
 */
export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug }: { slug: string }) => deleteEmailTemplate(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEY });
    },
  });
}
