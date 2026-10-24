import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUser } from "../api";
import { USERS_QUERY_KEY } from "./use-users";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
