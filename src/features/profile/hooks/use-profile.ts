import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { sessionStore } from "@/lib/session/session-store";

import { fetchProfile, updateProfile, uploadProfilePhoto } from "../api";
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
