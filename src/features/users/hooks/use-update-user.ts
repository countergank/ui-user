import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type UpdateUserPayload, updateUser } from "../api";
import { userQueryKey } from "./use-user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * @param id - the user id the mutation patches; success seeds the detail cache with the echoed
 * `UserDTO` and invalidates the users list so the edited row shows the new values.
 * @returns The update-user mutation for the edit form.
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(userQueryKey(id), updated);
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
