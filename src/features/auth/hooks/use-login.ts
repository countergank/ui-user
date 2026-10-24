import { useMutation } from "@tanstack/react-query";

import { sessionStore } from "@/lib/session/session-store";

import { login } from "../api";

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (auth) => {
      sessionStore.getState().startSession(auth);
    },
  });
}
