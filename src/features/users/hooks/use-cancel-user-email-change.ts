import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelUserEmailChange } from "../api";
import { userQueryKey } from "./use-user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * @returns The pending-email-change cancel mutation; the API answers only `{ message }` — no
 * `UserDTO` to seed caches with — so success invalidates the users list and the detail
 * refetches `hasPendingEmailChange`.
 */
export function useCancelUserEmailChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => cancelUserEmailChange(id),
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: userQueryKey(id) });
    },
  });
}
