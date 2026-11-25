import { useMutation, useQueryClient } from "@tanstack/react-query";

import { requestUserEmailChange } from "../api";
import { userQueryKey } from "./use-user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * @returns The email-change request mutation; the API answers only `{ message, userId }` — no
 * `UserDTO` to seed caches with — so success invalidates the users list and the detail
 * refetches `hasPendingEmailChange`.
 */
export function useRequestUserEmailChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => requestUserEmailChange(id, email),
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: userQueryKey(id) });
    },
  });
}
