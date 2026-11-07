import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProfile, updateProfile } from "../api";
import type { UpdateProfilePayload } from "../api";

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
