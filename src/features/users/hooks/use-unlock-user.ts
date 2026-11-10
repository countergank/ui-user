import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unlockUser } from "../api";
import { userQueryKey } from "./use-user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * @returns The unlock mutation; the API answers only `{ message, userId }` — no `UserDTO` to
 * seed caches with — so success invalidates the users list and the detail refetches.
 */
export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => unlockUser(id),
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: userQueryKey(id) });
    },
  });
}
