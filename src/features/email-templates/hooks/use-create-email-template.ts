import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEmailTemplate } from "../api";
import { EMAIL_TEMPLATES_QUERY_KEY } from "./use-email-templates";

/**
 * @returns The create-template mutation; success invalidates the templates list so the new row
 * appears.
 */
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEY });
    },
  });
}
