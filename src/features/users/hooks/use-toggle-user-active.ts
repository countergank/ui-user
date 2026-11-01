import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleUserActive } from "../api";
import { userQueryKey } from "./use-user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * @returns The toggle-active mutation; success seeds the detail cache with the echoed `UserDTO`
 * and invalidates the users list so the row shows the new status.
 */
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => toggleUserActive(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(userQueryKey(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
