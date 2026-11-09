import { useMutation } from "@tanstack/react-query";

import { requestPasswordReset } from "../api";

export function useForgotPassword() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}
