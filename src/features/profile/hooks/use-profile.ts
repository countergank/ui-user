import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { sessionStore } from "@/lib/session/session-store";

import {
  activateTwoFactor,
  enrollTwoFactor,
  fetchProfile,
  requestEmailChange,
  requestEmailChangeCode,
  updateProfile,
  uploadProfilePhoto,
} from "../api";
import type { UpdateProfilePayload } from "../api";
import type { ProfileDTO } from "../types";

export const PROFILE_QUERY_KEY = ["account", "profile"] as const;

/**
 * @returns The prefill query for the signed-in user's profile, validated against the
 * `ProfileDTO` schema by the fetcher.
 */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
  });
}

/**
 * @returns The TOTP enrollment mutation: asks the backend for a pending enrollment and
 * holds the one-time `secret` with its `otpauthUrl`. A re-enroll replaces the pending
 * secret server-side, so success here always supersedes any previous enrollment.
 */
export function useEnrollTwoFactor() {
  return useMutation({
    mutationFn: () => enrollTwoFactor(),
  });
}

/**
 * @returns The TOTP activation mutation: confirms the pending enrollment with the 6-digit
 * code from the authenticator app. The session user carries no two-factor flag yet, so
 * success only drives the card's activated state.
 */
export function useActivateTwoFactor() {
  return useMutation({
    mutationFn: (code: string) => activateTwoFactor(code),
  });
}

/**
 * @returns The upload-photo mutation; success seeds the session user with the served
 * `avatarUrl`, seeds the profile cache and invalidates the profile and the `/auth/me`
 * queries so every avatar in the app refetches from a consistent source.
 */
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: ({ avatarUrl }) => {
      sessionStore.getState().updateSessionUser({ avatarUrl });
      queryClient.setQueryData<ProfileDTO>(PROFILE_QUERY_KEY, (current) =>
        current === undefined ? current : { ...current, avatarUrl },
      );
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: permissionsQueryKey });
    },
  });
}

/**
 * @returns The identity-code request mutation: asks the backend to email a 6-digit
 * code to the current address. The code is required by the change request and never
 * travels in the HTTP response.
 */
export function useRequestEmailChangeCode() {
  return useMutation({
    mutationFn: () => requestEmailChangeCode(),
  });
}

/**
 * @returns The change-email request mutation. The change itself only completes when the
 * user confirms it from the email sent to the new address, so success here invalidates
 * nothing: the profile keeps its current email until that confirmation lands.
 */
export function useRequestEmailChange() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      requestEmailChange(email, code),
  });
}

/**
 * @returns The update-profile mutation; success seeds the profile cache with the echoed
 * `ProfileDTO` and invalidates it so anything reading the profile refetches.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated);
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
