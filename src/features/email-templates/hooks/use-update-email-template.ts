import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateEmailTemplate } from "../api";
import { emailTemplateQueryKey } from "./use-email-template";
import { EMAIL_TEMPLATES_QUERY_KEY } from "./use-email-templates";

/**
 * @returns The update-template mutation; success seeds the detail cache with the echoed
 * `EmailTemplateDTO` and invalidates the templates list so the row shows the new values.
 */
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Parameters<typeof updateEmailTemplate>[1];
    }) => updateEmailTemplate(slug, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(emailTemplateQueryKey(updated.slug), updated);
      void queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEY });
    },
  });
}
