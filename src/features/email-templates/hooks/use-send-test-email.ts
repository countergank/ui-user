import { useMutation } from "@tanstack/react-query";

import { sendTestEmail } from "../api";
import type { SendTestEmailPayload } from "../api";

/**
 * @returns The test-send mutation; feedback lives in the caller so the dialog can keep its
 * state while the request runs.
 */
export function useSendTestEmail() {
  return useMutation({
    mutationFn: (payload: SendTestEmailPayload) => sendTestEmail(payload),
  });
}
