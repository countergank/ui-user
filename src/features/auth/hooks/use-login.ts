import { useMutation } from "@tanstack/react-query";

import { sessionStore } from "@/lib/session/session-store";

import { isTwoFactorChallenge, login } from "../api";

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if (!isTwoFactorChallenge(response)) {
        sessionStore.getState().startSession(response);
      }
    },
  });
}
