import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteUser } from "../api";
import { userQueryKey } from "./use-user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * @returns The delete-user mutation; the deleted user has no detail left to refetch, so success
 * invalidates the users list and removes the detail cache instead of seeding it.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteUser(id),
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: userQueryKey(id) });
    },
  });
}
