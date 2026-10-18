import { useMutation } from "@tanstack/react-query";

import { sessionStore } from "@/lib/session/session-store";

import { login } from "../api";

/**
 * Login mutation (COU-281, T4 / S5).
 *
 * Starting the session is the success handler's job: the store then holds the user and
 * the tokens, and the composition root's subscription schedules the proactive refresh.
 * A failed login must not touch the store, which is why nothing happens on error.
 */
export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (auth) => {
      sessionStore.getState().startSession(auth);
    },
  });
}
