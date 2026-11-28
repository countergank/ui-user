import { useMutation } from "@tanstack/react-query";

import { sessionStore } from "@/lib/session/session-store";

import { verifyTwoFactorChallenge } from "../api";

export interface VerifyTwoFactorChallengeInput {
  challengeToken: string;
  code: string;
}

export function useVerifyTwoFactorChallenge() {
  return useMutation({
    mutationFn: ({ challengeToken, code }: VerifyTwoFactorChallengeInput) =>
      verifyTwoFactorChallenge(challengeToken, code),
    onSuccess: (auth) => {
      sessionStore.getState().startSession(auth);
    },
  });
}
