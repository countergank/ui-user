import { z } from "zod";

import { httpClient } from "@/lib/session/session";

import { activeSessionSchema } from "./types";
import type { ActiveSessionDTO } from "./types";

/**
 * @returns The signed-in user's active sessions, each validated against the
 * `ActiveSessionDTO` contract so a drift fails at the fetcher and not in the list.
 */
export async function fetchSessions(): Promise<ActiveSessionDTO[]> {
  const raw = await httpClient.request<unknown>("/auth/sessions");

  return z.array(activeSessionSchema).parse(raw);
}

/**
 * @param sessionId - the stable id of one of the user's own sessions, as listed by
 * `fetchSessions`; revoking the current session also kills the local one, which
 * the caller must handle.
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await httpClient.request<unknown>(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

/**
 * Invalidates every refresh token of the user; the access token stays valid until it
 * expires, so the caller must also clear the local session to actually sign out.
 */
export async function logoutAll(): Promise<void> {
  await httpClient.request<unknown>("/auth/logout-all", {
    method: "POST",
  });
}
